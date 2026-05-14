#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('../../..', import.meta.url).pathname);
const plugin = path.join(root, 'plugins', 'codex-agentic-workflow');
const checks = [];

function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

function json(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    check(`json: ${file}`, false, error.message);
    return null;
  }
}

const marketplace = json(path.join(root, '.agents', 'plugins', 'marketplace.json'));
check('marketplace has plugin entry', !!marketplace?.plugins?.some((p) => p.name === 'codex-agentic-workflow'));

const manifest = json(path.join(plugin, '.codex-plugin', 'plugin.json'));
check('manifest name', manifest?.name === 'codex-agentic-workflow');
check('manifest skills path', manifest?.skills === './skills/');
check('manifest hooks path', manifest?.hooks === './hooks.json');

const hooks = json(path.join(plugin, 'hooks.json'));
check('hooks SessionStart', !!hooks?.hooks?.SessionStart);
check('hooks UserPromptSubmit', !!hooks?.hooks?.UserPromptSubmit);

for (const skill of ['agentic-workflow', 'init-agentic', 'blocker', 'handoff', 'known-issue', 'personal-engineering-rules']) {
  const file = path.join(plugin, 'skills', skill, 'SKILL.md');
  check(`skill exists: ${skill}`, fs.existsSync(file));
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    check(`skill frontmatter: ${skill}`, text.startsWith('---\n') && text.includes('description:'));
  }
}

for (const script of ['session-start.mjs', 'user-prompt-submit.mjs', 'validate.mjs', 'link-home-marketplace.mjs']) {
  check(`script exists: ${script}`, fs.existsSync(path.join(plugin, 'scripts', script)));
}

let failures = 0;
for (const item of checks) {
  if (!item.ok) failures += 1;
  console.log(`${item.ok ? '[x]' : '[ ]'} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

process.exitCode = failures ? 1 : 0;
