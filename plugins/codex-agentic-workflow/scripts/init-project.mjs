#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const pluginRoot = path.resolve(new URL('..', import.meta.url).pathname);
const templatePath = path.join(pluginRoot, 'templates', 'AGENTS.md');
const writeAgents = !process.argv.includes('--no-agents');

const results = [];
const warnings = [];

function note(action, file) {
  results.push(`${action} ${path.relative(cwd, file) || '.'}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    note('created', dir);
  }
}

function writeIfMissing(file, content) {
  if (fs.existsSync(file)) {
    note('kept', file);
    return;
  }
  fs.writeFileSync(file, content);
  note('created', file);
}

function ensureGitignore() {
  const file = path.join(cwd, '.gitignore');
  const line = '.localdev/';
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${line}\n`);
    note('created', file);
    return;
  }

  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).map((item) => item.trim());
  if (!lines.includes(line)) {
    const suffix = text.endsWith('\n') || text.length === 0 ? '' : '\n';
    fs.appendFileSync(file, `${suffix}${line}\n`);
    note('updated', file);
  } else {
    note('kept', file);
  }

  if (lines.includes('docs/') || lines.includes('docs/KNOWN_ISSUES.md')) {
    warnings.push('docs/KNOWN_ISSUES.md appears to be ignored; review .gitignore before relying on durable known issues.');
  }
}

function installAgentsSnippet() {
  if (!writeAgents) return;

  const file = path.join(cwd, 'AGENTS.md');
  const snippet = fs.readFileSync(templatePath, 'utf8').trim();
  const start = '<!-- codex-agentic-workflow:start -->';
  const end = '<!-- codex-agentic-workflow:end -->';

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${snippet}\n`);
    note('created', file);
    return;
  }

  const text = fs.readFileSync(file, 'utf8');
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end);
  if (startIndex >= 0 && endIndex > startIndex) {
    const before = text.slice(0, startIndex).trimEnd();
    const after = text.slice(endIndex + end.length).trimStart();
    const next = [before, snippet, after].filter(Boolean).join('\n\n');
    fs.writeFileSync(file, `${next}\n`);
    note('updated', file);
    return;
  }

  const separator = text.endsWith('\n') ? '\n' : '\n\n';
  fs.appendFileSync(file, `${separator}${snippet}\n`);
  note('updated', file);
}

ensureDir(path.join(cwd, '.localdev', 'workflow', 'handoffs'));
ensureDir(path.join(cwd, 'docs'));

writeIfMissing(path.join(cwd, '.localdev', 'workflow', 'todo.md'), `# Todo\n\n`);
writeIfMissing(path.join(cwd, '.localdev', 'workflow', 'done.md'), `# Done\n\n`);
writeIfMissing(path.join(cwd, '.localdev', 'workflow', 'blockers.md'), `# Active Blockers\n\n<!-- Entries must start with: ## YYYY-MM-DD HH:MM - <summary> -->\n`);
writeIfMissing(path.join(cwd, '.localdev', 'workflow', 'findings.md'), `# Findings\n\nEphemeral discoveries for the current task. Move durable project constraints to docs/KNOWN_ISSUES.md.\n`);
writeIfMissing(path.join(cwd, 'docs', 'KNOWN_ISSUES.md'), `# Known Issues\n\n<!-- Durable project constraints. Include Status, Issue, Workaround, Affects, Ref. -->\n`);

ensureGitignore();
installAgentsSnippet();

for (const result of results) console.log(result);
for (const warning of warnings) console.log(`warning ${warning}`);
