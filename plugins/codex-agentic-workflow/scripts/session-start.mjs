#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const root = path.join(cwd, '.localdev', 'workflow');
if (!fs.existsSync(root)) process.exit(0);

const out = [];
function compact(value, max = 140) {
  const singleLine = value.replace(/\s+/g, ' ').trim();
  return singleLine.length > max ? `${singleLine.slice(0, max - 3)}...` : singleLine;
}

function field(card, name) {
  const match = card.match(new RegExp(`^- ${name}:\\s*(.+)$`, 'im'));
  return match ? compact(match[1]) : null;
}

function activeTodoCards(text) {
  const cards = [];
  const lines = text.split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    const header = line.match(/^## \[(doing|blocked)\] (.+)$/);
    if (header) {
      current = { status: header[1], title: header[2], body: [] };
      cards.push(current);
      continue;
    }

    if (/^## /.test(line)) {
      current = null;
      continue;
    }

    if (current) current.body.push(line);
  }

  return cards;
}

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
  const active = activeTodoCards(text)
    .map((card) => {
      const title = compact(card.title);
      const body = card.body.join('\n');
      const attempts = field(body, 'Attempts');
      const dod = field(body, 'DoD');
      const detail = [
        attempts ? `Attempts: ${attempts}` : null,
        dod ? `DoD: ${dod}` : null,
      ].filter(Boolean).join('; ');
      return detail ? `[${card.status}] ${title} (${detail})` : `[${card.status}] ${title}`;
    })
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
