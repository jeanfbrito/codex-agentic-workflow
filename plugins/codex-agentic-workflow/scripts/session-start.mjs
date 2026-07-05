#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const root = path.join(cwd, '.localdev', 'workflow');
if (!fs.existsSync(root)) process.exit(0);

const out = [];
const blockers = path.join(root, 'blockers.md');
if (fs.existsSync(blockers)) {
  const text = fs.readFileSync(blockers, 'utf8');
  if (/^## \d{4}-\d{2}-\d{2}/m.test(text)) {
    out.push('agentic: active blockers in .localdev/workflow/blockers.md');
  }
}

const todo = path.join(root, 'todo.md');
if (fs.existsSync(todo)) {
  const text = fs.readFileSync(todo, 'utf8');
  const active = [...text.matchAll(/^## \[(doing|blocked)\] (.+)$/gm)]
    .map((match) => `[${match[1]}] ${match[2].trim()}`)
    .slice(0, 5);
  for (const card of active) {
    out.push(`agentic: active todo ${card}`);
  }
}

const handoffs = path.join(root, 'handoffs');
if (fs.existsSync(handoffs)) {
  const files = fs.readdirSync(handoffs)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .slice(0, 5);
  for (const file of files) {
    out.push(`agentic: open handoff .localdev/workflow/handoffs/${file}`);
  }
}

if (out.length) {
  console.log(out.join('\n'));
}
