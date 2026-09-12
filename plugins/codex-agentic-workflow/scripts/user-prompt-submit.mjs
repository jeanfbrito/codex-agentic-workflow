#!/usr/bin/env node
let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

let payload = {};
try { payload = JSON.parse(input || '{}'); } catch {}

const prompt = String(payload.prompt || payload.user_prompt || payload.input || '').trim();
if (!prompt) process.exit(0);

const lower = prompt.toLowerCase();
const bypass = [
  'off orchestrator',
  'orchestrator off',
  'do it yourself',
  '/blocker',
  '/handoff',
  '/known-issue',
  '/init-agentic',
];
if (bypass.some((item) => lower.includes(item))) process.exit(0);

const workVerb = /\b(refactor|implement|fix|debug|investigate|review|port|migrate|build|add|change|update|rewrite|analyze|wire)\b/i;
if (!workVerb.test(prompt)) process.exit(0);

console.log([
  'agentic: follow /Users/jean/Github/codex-agentic-workflow/plugins/codex-agentic-workflow/AGENTIC.md (read once).',
  'Reuse context; discovery budget 3 calls, extend only for a named gap; concise derived output via context-mode/RTK; GitNexus for structural questions.',
  'Patch directly; no unnecessary installers/reports. Stop after focused DoD passes; no duplicate searches/tests.',
  'Check relevant workflow state/known issues; completed cards go to done.md.',
  'Delegate only on explicit user request; reuse agents; main thread owns servers.',
].join(' '));
