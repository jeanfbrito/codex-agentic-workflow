import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const plugin = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-lifecycle-check-'));
const root = path.join(temp, '.localdev', 'workflow');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const run = (script, payload = {}) => execFileSync(process.execPath, [path.join(plugin, 'scripts', script)], {
  cwd: temp,
  input: JSON.stringify({ cwd: temp, session_id: 'check-session', ...payload }),
  encoding: 'utf8',
  timeout: 5000,
});
try {
  check(run('session-start.mjs') === '', 'silent outside initialized projects');
  check(JSON.parse(run('stop-ledger-audit.mjs')).decision === undefined, 'no-work stop does not block');
  fs.mkdirSync(path.join(root, 'handoffs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'todo.md'), '# Todo\n\n## [doing] In-flight task\n- Attempts: 1/2\n- DoD: exercise real hook entrypoints\n\n## [todo] Next card\n- Attempts: 0/2\n');
  const handoff = path.join(root, 'handoffs', 'old.md');
  fs.writeFileSync(handoff, '# Handoff');
  const old = new Date(Date.now() - 9 * 86400000);
  fs.utimesSync(handoff, old, old);
  const start = run('session-start.mjs');
  check(start.includes('[todo] Next card') && start.includes('DoD: exercise'), 'all open cards and DoD');
  check(start.includes('STALE'), 'handoff age warning');
  run('pre-compact.mjs');
  const otherSession = run('session-start.mjs', { source: 'resume', session_id: 'another-session' });
  check(!otherSession.includes('do NOT re-dispatch'), 'snapshot isolation');
  const recovery = run('session-start.mjs', { source: 'compact' });
  check(recovery.includes('do NOT re-dispatch') && recovery.includes('In-flight task'), 'live entrypoint compaction recovery');
  check(!run('session-start.mjs', { source: 'resume' }).includes('do NOT re-dispatch'), 'snapshot consumed once');
  run('pre-compact.mjs');
  run('session-start.mjs', { source: 'startup' });
  check(!run('session-start.mjs', { source: 'resume' }).includes('do NOT re-dispatch'), 'startup clears old snapshot');
  const transcript = path.join(temp, 'rollout.jsonl');
  const records = [];
  for (let i = 0; i < 3; i++) {
    records.push({ type: 'response_item', payload: { type: 'custom_tool_call', name: 'apply_patch', call_id: `edit-${i}`, input: `*** Begin Patch\n*** Add File: src/${i}.txt\n+x\n*** End Patch` } });
    records.push({ timestamp: new Date().toISOString(), type: 'response_item', payload: { type: 'custom_tool_call_output', call_id: `edit-${i}`, output: 'Success. Updated the following files.' } });
  }
  fs.writeFileSync(transcript, records.map((row) => JSON.stringify(row)).join('\n'));
  const stop = JSON.parse(run('stop-ledger-audit.mjs', { transcript_path: transcript }));
  check(stop.systemMessage.includes('3 non-ledger files') && stop.decision === undefined && stop.continue === undefined, 'native edit audit is advisory');
  const auditStart = run('session-start.mjs');
  check(auditStart.includes('3 non-ledger files'), 'audit appears at next startup');
  check(!run('session-start.mjs').includes('3 non-ledger files'), 'audit consumed once');
  check(Object.keys(JSON.parse(run('stop-ledger-audit.mjs', { transcript_path: transcript, stop_hook_active: true }))).length === 0, 'stop loop guard');
  fs.writeFileSync(path.join(root, 'blockers.md'), '## 2026-09-12 12:00 - Needs decision\n');
  check(JSON.parse(run('stop-ledger-audit.mjs', { transcript_path: transcript })).systemMessage.includes('disagree'), 'blocked-card consistency');
  fs.writeFileSync(transcript, records.map((row) => JSON.stringify(row).replaceAll('Success. Updated the following files.', 'Error: permission denied')).join('\n'));
  check(!JSON.parse(run('stop-ledger-audit.mjs', { transcript_path: transcript })).systemMessage.includes('3 non-ledger'), 'failed edits are not counted');
  fs.writeFileSync(path.join(root, 'todo.md'), '# Todo\n'+Array.from({ length: 200 }, (_, i) => `\n## [todo] Card ${i} ${'x'.repeat(180)}\n- Attempts: 0/2\n`).join(''));
  const bounded = run('session-start.mjs');
  check(bounded.length <= 4000 && bounded.includes('STALE'), 'budget keeps smaller later items');
  console.log(`PASS: ${checks} lifecycle checks through real hook subprocesses (synthetic project/transcript fixtures).`);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
