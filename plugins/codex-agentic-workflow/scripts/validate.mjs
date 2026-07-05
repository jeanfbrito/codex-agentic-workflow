#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
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

function runNode(script, options = {}) {
  return execFileSync(process.execPath, [script, ...(options.args || [])], {
    cwd: options.cwd || root,
    input: options.input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function withTempProject(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-agentic-workflow-'));
  try {
    callback(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const marketplace = json(path.join(root, '.agents', 'plugins', 'marketplace.json'));
check('marketplace has plugin entry', !!marketplace?.plugins?.some((p) => p.name === 'codex-agentic-workflow'));

const manifest = json(path.join(plugin, '.codex-plugin', 'plugin.json'));
check('manifest name', manifest?.name === 'codex-agentic-workflow');
check('manifest skills path', manifest?.skills === './skills/');
check('manifest has no hooks placeholder', !('hooks' in (manifest || {})));
check('manifest default prompt mentions project setup', manifest?.interface?.defaultPrompt?.some((item) => item.includes('workflow')));

const rootReadme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
check('readme documents done log', rootReadme.includes('done.md'));
check('readme uses capability tiers', rootReadme.includes('Capability tier'));

for (const skill of ['agentic-workflow', 'init-agentic', 'blocker', 'handoff', 'known-issue', 'personal-engineering-rules']) {
  const file = path.join(plugin, 'skills', skill, 'SKILL.md');
  check(`skill exists: ${skill}`, fs.existsSync(file));
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    check(`skill frontmatter: ${skill}`, text.startsWith('---\n') && text.includes('description:'));
    if (skill === 'agentic-workflow') {
      check('agentic skill uses status cards', text.includes('## [doing] <task title>'));
      check('agentic skill documents done log', text.includes('.localdev/workflow/done.md'));
      check('agentic skill avoids pinned model names', !/gpt-\d/i.test(text));
    }
    if (skill === 'init-agentic') {
      check('init skill scaffolds done log', text.includes('.localdev/workflow/done.md'));
      check('init skill references initializer script', text.includes('init-project.mjs'));
    }
  }
}

for (const script of ['session-start.mjs', 'user-prompt-submit.mjs', 'install-codex-hooks.mjs', 'validate.mjs', 'link-home-marketplace.mjs', 'init-project.mjs']) {
  check(`script exists: ${script}`, fs.existsSync(path.join(plugin, 'scripts', script)));
}

check('agents template exists', fs.existsSync(path.join(plugin, 'templates', 'AGENTS.md')));

const sessionStart = path.join(plugin, 'scripts', 'session-start.mjs');
const promptHook = path.join(plugin, 'scripts', 'user-prompt-submit.mjs');
const initProject = path.join(plugin, 'scripts', 'init-project.mjs');

withTempProject((dir) => {
  fs.mkdirSync(path.join(dir, '.localdev', 'workflow', 'handoffs'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.localdev', 'workflow', 'blockers.md'), '# Active Blockers\n\n## 2026-07-05 12:00 - Waiting on decision\n- Context: test\n');
  fs.writeFileSync(path.join(dir, '.localdev', 'workflow', 'todo.md'), [
    '# Todo',
    '',
    '## [doing] Active task',
    '- Assignee: main-thread',
    '- Attempts: 1/2',
    '- DoD: prove active summaries include details',
    '- Deps: none',
    '',
    '## [todo] Backlog task',
    '- Assignee: main-thread',
    '- Attempts: 0/2',
    '- DoD: should not print',
    '- Deps: none',
    '',
    '## [blocked] Stuck task',
    '- Assignee: main-thread',
    '- Attempts: 2/2',
    '- DoD: prove blocked summaries include details',
    '- Deps: none',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(dir, '.localdev', 'workflow', 'handoffs', 'demo.md'), '# Handoff\n');

  const output = runNode(sessionStart, { cwd: dir });
  check('session hook reports active blocker', output.includes('active blockers'));
  check('session hook reports doing card details', output.includes('[doing] Active task') && output.includes('Attempts: 1/2') && output.includes('DoD: prove active summaries'));
  check('session hook reports blocked card details', output.includes('[blocked] Stuck task') && output.includes('Attempts: 2/2'));
  check('session hook skips todo backlog', !output.includes('Backlog task'));
  check('session hook reports handoff', output.includes('handoffs/demo.md'));
});

const promptOutput = runNode(promptHook, {
  input: JSON.stringify({ prompt: 'please rewrite this project and update the workflow hooks and documentation to match the framework conventions' }),
});
check('prompt hook reminds about done log', promptOutput.includes('done.md'));

withTempProject((dir) => {
  const output = runNode(initProject, { cwd: dir });
  for (const file of [
    '.localdev/workflow/todo.md',
    '.localdev/workflow/done.md',
    '.localdev/workflow/blockers.md',
    '.localdev/workflow/findings.md',
    '.localdev/workflow/handoffs',
    'docs/KNOWN_ISSUES.md',
    'AGENTS.md',
  ]) {
    check(`init creates ${file}`, fs.existsSync(path.join(dir, file)));
  }
  check('init adds localdev gitignore', fs.readFileSync(path.join(dir, '.gitignore'), 'utf8').includes('.localdev/'));
  check('init writes agents marker', fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8').includes('codex-agentic-workflow:start'));
  check('init prints created paths', output.includes('created .localdev/workflow/todo.md'));
});

withTempProject((dir) => {
  runNode(initProject, { cwd: dir, args: ['--no-agents'] });
  check('init --no-agents skips AGENTS.md', !fs.existsSync(path.join(dir, 'AGENTS.md')));
});

let failures = 0;
for (const item of checks) {
  if (!item.ok) failures += 1;
  console.log(`${item.ok ? '[x]' : '[ ]'} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

process.exitCode = failures ? 1 : 0;
