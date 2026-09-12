#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const plugin = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(os.homedir(), '.codex', 'agents');
const backup = path.join(os.homedir(), '.codex', 'backups', `agentic-roles-${Date.now()}`);
fs.mkdirSync(target, { recursive: true });
fs.mkdirSync(backup, { recursive: true });
for (const file of fs.readdirSync(path.join(plugin, 'agents')).filter((f) => f.endsWith('.toml'))) {
  const destination = path.join(target, file);
  if (fs.existsSync(destination)) fs.copyFileSync(destination, path.join(backup, file));
  fs.copyFileSync(path.join(plugin, 'agents', file), destination);
}
console.log(`Installed framework roles to ${target}; previous files backed up in ${backup}`);
