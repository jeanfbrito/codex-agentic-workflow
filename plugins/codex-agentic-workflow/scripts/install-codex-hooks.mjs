#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const pluginRoot = path.resolve(new URL('..', import.meta.url).pathname);
const hooksPath = path.join(home, '.codex', 'hooks.json');
const backupPath = `${hooksPath}.bak.codex-agentic-workflow`;

const entries = [
  { event: 'PreCompact', matcher: '', command: `node "${path.join(pluginRoot, 'scripts', 'pre-compact.mjs')}"` },
  { event: 'Stop', matcher: '', command: `node "${path.join(pluginRoot, 'scripts', 'stop-ledger-audit.mjs')}"` },
  {
    event: 'SessionStart',
    matcher: '',
    command: `node "${path.join(pluginRoot, 'scripts', 'session-start.mjs')}"`,
  },
  {
    event: 'UserPromptSubmit',
    matcher: '',
    command: `node "${path.join(pluginRoot, 'scripts', 'user-prompt-submit.mjs')}"`,
  },
];

function loadHooks() {
  if (!fs.existsSync(hooksPath)) {
    return { hooks: {} };
  }

  return JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
}

function isAgenticHook(entry) {
  return JSON.stringify(entry).includes('/codex-agentic-workflow/');
}

fs.mkdirSync(path.dirname(hooksPath), { recursive: true });

const config = loadHooks();
config.hooks ||= {};

if (fs.existsSync(hooksPath) && !fs.existsSync(backupPath)) {
  fs.copyFileSync(hooksPath, backupPath);
}

for (const { event, matcher, command } of entries) {
  const existing = Array.isArray(config.hooks[event]) ? config.hooks[event] : [];
  config.hooks[event] = existing.filter((entry) => !isAgenticHook(entry));
  config.hooks[event].push({
    matcher,
    hooks: [
      {
        type: 'command',
        command,
      },
    ],
  });
}

fs.writeFileSync(hooksPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`updated ${hooksPath}`);
if (fs.existsSync(backupPath)) {
  console.log(`backup ${backupPath}`);
}
