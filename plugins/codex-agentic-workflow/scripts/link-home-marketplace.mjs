#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const repo = path.resolve(new URL('../../..', import.meta.url).pathname);
const sourcePlugin = path.join(repo, 'plugins', 'codex-agentic-workflow');
const homePluginRoot = path.join(home, 'plugins');
const homePlugin = path.join(homePluginRoot, 'codex-agentic-workflow');
const marketplacePath = path.join(home, '.agents', 'plugins', 'marketplace.json');

fs.mkdirSync(homePluginRoot, { recursive: true });
fs.mkdirSync(path.dirname(marketplacePath), { recursive: true });

try {
  if (fs.existsSync(homePlugin)) {
    const stat = fs.lstatSync(homePlugin);
    if (!stat.isSymbolicLink() || fs.realpathSync(homePlugin) !== sourcePlugin) {
      throw new Error(`${homePlugin} exists and is not the expected symlink`);
    }
  } else {
    fs.symlinkSync(sourcePlugin, homePlugin, 'dir');
  }

  let marketplace = {
    name: 'local',
    interface: { displayName: 'Local Plugins' },
    plugins: [],
  };
  if (fs.existsSync(marketplacePath)) {
    marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
    marketplace.plugins ||= [];
    marketplace.interface ||= { displayName: 'Local Plugins' };
  }

  const entry = {
    name: 'codex-agentic-workflow',
    source: { source: 'local', path: './plugins/codex-agentic-workflow' },
    policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  };

  const index = marketplace.plugins.findIndex((p) => p.name === entry.name);
  if (index >= 0) marketplace.plugins[index] = entry;
  else marketplace.plugins.push(entry);

  fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
  console.log(`linked ${homePlugin} -> ${sourcePlugin}`);
  console.log(`updated ${marketplacePath}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
