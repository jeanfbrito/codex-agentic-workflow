#!/usr/bin/env node
let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

let payload = {};
try { payload = JSON.parse(input || '{}'); } catch {}

const prompt = String(payload.prompt || payload.user_prompt || payload.input || '').trim();
if (prompt.length < 40) process.exit(0);

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

const workVerb = /\b(refactor|implement|fix|debug|investigate|review|port|migrate|build|add|change|update|rewrite|analyze)\b/i;
if (!workVerb.test(prompt)) process.exit(0);

console.log([
  'agentic workflow reminder:',
  '- check .localdev/workflow and docs/KNOWN_ISSUES.md when relevant;',
  '- use blockers/handoffs for multi-session state;',
  '- spawn subagents only when the user explicitly asked for delegation or parallel agents.',
].join(' '));
