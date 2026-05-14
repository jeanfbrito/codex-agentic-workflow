#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const root = path.join(cwd, '.Codex', 'mytasks');
if (!fs.existsSync(root)) process.exit(0);

const out = [];
const blockers = path.join(root, 'blockers.md');
if (fs.existsSync(blockers)) {
  const text = fs.readFileSync(blockers, 'utf8');
  if (/^## \d{4}-\d{2}-\d{2}/m.test(text)) {
    out.push('agentic: active blockers in .Codex/mytasks/blockers.md');
  }
}

const handoffs = path.join(root, 'handoffs');
if (fs.existsSync(handoffs)) {
  const files = fs.readdirSync(handoffs)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .slice(0, 5);
  for (const file of files) {
    out.push(`agentic: open handoff .Codex/mytasks/handoffs/${file}`);
  }
}

if (out.length) {
  console.log(out.join('\n'));
}
