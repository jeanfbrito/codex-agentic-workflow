---
name: "agentic-workflow"
description: "Use when the user asks for /agentic, agentic workflow, multi-session task coordination, explicit subagent delegation, or a structured task ledger workflow in Codex."
---

# Agentic Workflow

Use this skill for non-trivial work that benefits from persistent task state,
handoffs, blockers, and explicit delegation.

## Codex Adaptation

Use these Codex workflow rules:

- Do not spawn subagents unless the user explicitly asks for agents, subagents,
  delegation, or parallel agent work.
- Keep the main thread responsible for the critical path.
- Use Codex plans and concise user updates for local work.
- Use `.localdev/workflow/` for multi-session working state.
- Use `docs/KNOWN_ISSUES.md` for committed, durable project constraints.

## Startup Checklist

At task start, check these files when they exist:

- `.localdev/workflow/blockers.md`
- `.localdev/workflow/handoffs/*.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/todo.md`
- `docs/KNOWN_ISSUES.md`

Do not dump file contents into chat. Summarize only relevant blockers,
handoffs, known issues, and current Definition of Done.

## Tier Semantics

- `trivial`: one small change or answer. Work locally. No task ledger unless
  the user asks.
- `medium`: multi-step or 2+ files. Write/update `.localdev/workflow/todo.md`
  with a short Definition of Done. Delegate only if the user explicitly asked.
- `full`: ambiguous architecture, multiple subsystems, risky refactor, or
  multi-session task. Use todo, blockers, findings, handoffs, and known issues.
  If the user requested agents, split work by disjoint ownership.

## Role Mapping

When delegation is explicitly allowed, map workflow roles to Codex agent roles:

- Planner -> `planner`
- Finder -> `finder` or `explorer`
- Researcher -> `researcher`
- builder-fast -> `builder-fast` or `worker` for mechanical edits
- builder-smart -> `builder-smart` or `worker` for complex implementation
- Reviewer -> `reviewer`
- Tester -> `tester`
- Auditor -> `auditor` only after repeated failed attempts or root-cause stalls

## Model Policy

When the user explicitly asks for subagents, delegation, or parallel agent work,
route models by role:

| Workflow role | Codex role | Model | Reasoning |
| --- | --- | --- | --- |
| Explore | `finder` / `explorer` | `gpt-5.4-mini` | `medium` |
| Context Builder | `researcher` / `finder` | `gpt-5.3-codex` | `medium` |
| Engineer | `builder-fast` / `builder-smart` / `worker` | `gpt-5.3-codex` | `medium` |
| Pair | `reviewer` / paired implementation review | `gpt-5.5` | `high` |
| Design | `planner` | `gpt-5.5` | `medium` |
| Audit | `auditor` | `gpt-5.5` | `high` |
| Test | `tester` | `gpt-5.4-mini` | `medium` |

Escalate planning/review to `gpt-5.5` with `high` reasoning for ambiguous
architecture, risky changes, or cross-subsystem decisions. Use `xhigh` only
after repeated failed attempts or when the user asks for maximum reasoning.

Do not override the model for casual local work. Use this table when model
routing is part of an explicit agentic workflow.

## Exploration Flow

Use this order when exploring code:

1. GitNexus first for code graph questions, impact analysis, callers/callees,
   and execution-flow discovery.
2. context-mode for large searches, large files, logs, test output, and any
   command output likely to exceed a short screenful.
3. `finder` / `explorer` with `gpt-5.4-mini` medium for bounded source
   exploration that remains after graph/context queries.
4. `gpt-5.5` for planning, design, review, audit, and decisions after the code
   map is condensed.

Use RTK for short shell commands where token-filtered output helps and
context-mode is not the better route. Do not use RTK as a substitute for
context-mode on large outputs.

## Task Ledger

When using the ledger, keep `.localdev/workflow/todo.md` short:

```markdown
# Todo

## Task
<one paragraph>

## Definition of Done
- <observable outcome>
- <verification command or evidence>

## Steps
- [ ] <step>
```

Update task status as work progresses. Do not let the ledger become a long log.

## Blockers

If a decision cannot be resolved from code, docs, tests, or git history, use the
`blocker` skill. Append the blocker, stop the current task, and ask the user.

## Handoffs

For work that cannot finish in the current session, use the `handoff` skill.
Capture state, files touched, verification, unresolved risks, and next steps.

## Known Issues

When a platform or dependency constraint will affect future work, use the
`known-issue` skill. Known issues belong in `docs/KNOWN_ISSUES.md` and are
intended to be committed.
