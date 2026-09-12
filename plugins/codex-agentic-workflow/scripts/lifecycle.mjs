import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';

export async function runLifecycle(event) {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  let payload;
  try { payload = JSON.parse(raw || '{}'); } catch { payload = {}; }
  const cwd = path.resolve(payload.cwd || process.cwd());
  const root = path.join(cwd, '.localdev', 'workflow');
  if (!fs.existsSync(root)) {
    if (event === 'Stop') console.log('{}');
    return;
  }
  const key = crypto.createHash('sha256').update(String(payload.session_id || 'local')).digest('hex').slice(0, 16);
  const snapshot = path.join(root, `_precompact-${key}.json`);
  const audit = path.join(root, `_audit-pending-${key}.md`);
  const read = (name) => {
    try { return fs.readFileSync(path.join(root, name), 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return ''; throw error; }
  };
  const compact = (text, max = 140) => {
    const value = text.replace(/\s+/g, ' ').trim();
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
  };
  const todo = read('todo.md');
  const cards = [...todo.matchAll(/^## \[(todo|doing|blocked)\] (.+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  const blockers = [...read('blockers.md').matchAll(/^## (\d{4}-\d{2}-\d{2}[^\n]*)/gm)];
  const active = cards.filter((card) => card[1] !== 'todo');
  const title = (card) => `[${card[1]}] ${compact(card[2])}`;
  if (event === 'PreCompact') {
    if (active.length) {
      const tmp = `${snapshot}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify({ at: Date.now(), cards: active.map(title) }));
      fs.renameSync(tmp, snapshot);
    } else fs.rmSync(snapshot, { force: true });
    return;
  }
  if (event === 'SessionStart') {
    const out = [];
    let size = 0;
    const add = (text) => {
      if (size + text.length + 1 > 4000) return false;
      out.push(text); size += text.length + 1; return true;
    };
    if (fs.existsSync(snapshot)) {
      try {
        const saved = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
        if (['compact', 'resume'].includes(payload.source) && Date.now() - saved.at >= 0 && Date.now() - saved.at < 86400000) {
          add('agentic: compaction recovery; do NOT re-dispatch existing work. Check live agents with list_agents first.');
          for (const card of saved.cards || []) add(`agentic: in-flight ${compact(String(card))}`);
        }
      } catch (error) { add(`agentic: unreadable compaction snapshot: ${compact(error.message)}`); }
      fs.rmSync(snapshot, { force: true });
    }
    if (fs.existsSync(audit)) {
      const pending = fs.readFileSync(audit, 'utf8');
      if (add(pending)) fs.rmSync(audit, { force: true });
      else add(`agentic: pending audit in .localdev/workflow/${path.basename(audit)}`);
    }
    for (const blocker of blockers) add(`agentic: active blockers: ${compact(blocker[1])}`);
    for (const card of cards) {
      const fields = ['Attempts', 'DoD'].flatMap((name) => {
        const match = card[3].match(new RegExp(`^- ${name}:\\s*(.+)$`, 'im'));
        return match ? [`${name}: ${compact(match[1])}`] : [];
      });
      add(`agentic: active todo ${title(card)}${fields.length ? ` (${fields.join('; ')})` : ''}`);
    }
    const handoffs = path.join(root, 'handoffs');
    if (fs.existsSync(handoffs)) for (const file of fs.readdirSync(handoffs).filter((f) => f.endsWith('.md')).sort()) {
      const age = Math.max(0, Math.floor((Date.now() - fs.statSync(path.join(handoffs, file)).mtimeMs) / 86400000));
      add(`agentic: open handoff .localdev/workflow/handoffs/${compact(file)} (${age}d${age > 7 ? '; STALE' : ''})`);
    }
    if (!out.length) add('agentic: armed');
    console.log(out.join('\n'));
    return;
  }
  if (event !== 'Stop') return;
  if (payload.stop_hook_active || !payload.transcript_path || !fs.existsSync(payload.transcript_path)) {
    console.log('{}'); return;
  }
  const calls = new Map();
  const writes = new Set();
  let latestWrite = 0;
  // The transcript is not a stable public API. Recognize successful native
  // edit calls only; never infer shell writes from command text.
  for await (const line of readline.createInterface({ input: fs.createReadStream(payload.transcript_path), crlfDelay: Infinity })) {
    let record;
    try { record = JSON.parse(line); } catch { continue; }
    const item = record.payload || record;
    if (['function_call', 'custom_tool_call'].includes(item.type)) {
      const name = String(item.name || '').split('.').pop();
      if (!['apply_patch', 'Write', 'Edit', 'write_file', 'edit_file'].includes(name)) continue;
      let args = item.arguments ?? item.input ?? {};
      if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = { command: args }; } }
      const patch = args.command || args.patch || '';
      const files = name === 'apply_patch'
        ? [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map((m) => m[1])
        : [args.file_path || args.path].filter(Boolean);
      calls.set(item.call_id, files);
    }
    if (['function_call_output', 'custom_tool_call_output'].includes(item.type) && calls.has(item.call_id)) {
      const output = typeof item.output === 'string' ? item.output : JSON.stringify(item.output);
      const files = calls.get(item.call_id);
      calls.delete(item.call_id);
      if (!output || /(?:isError["\s:]+true|error|failed|denied)/i.test(output) || !/(?:Success|updated|written|exit_code["\s:]+0)/i.test(output)) continue;
      for (const file of files) {
        const relative = path.relative(cwd, path.resolve(cwd, file)).replaceAll(path.sep, '/');
        if (!relative.startsWith('../') && !path.isAbsolute(relative)) writes.add(relative);
      }
      latestWrite = Math.max(latestWrite, Date.parse(record.timestamp || '') || 0);
    }
  }
  const issues = [];
  const sourceWrites = [...writes].filter((file) => !file.startsWith('.localdev/workflow/') && file !== 'docs/KNOWN_ISSUES.md');
  const donePath = path.join(root, 'done.md');
  if (sourceWrites.length >= 3 && !writes.has('.localdev/workflow/done.md') && (!fs.existsSync(donePath) || fs.statSync(donePath).mtimeMs < latestWrite)) {
    issues.push(`agentic audit: ${sourceWrites.length} non-ledger files edited without a current done entry; record completion or leave a handoff.`);
  }
  if (active.some((card) => card[1] === 'doing') && !writes.has('.localdev/workflow/todo.md')) issues.push('agentic audit: a [doing] card remains and todo.md was not edited in the recognized transcript calls.');
  if (cards.some((card) => card[1] === 'blocked') !== (blockers.length > 0)) issues.push('agentic audit: blockers.md and [blocked] cards disagree.');
  if (!issues.length) { fs.rmSync(audit, { force: true }); console.log('{}'); return; }
  const message = issues.join('\n');
  fs.writeFileSync(audit, message);
  console.log(JSON.stringify({ systemMessage: message }));
}
