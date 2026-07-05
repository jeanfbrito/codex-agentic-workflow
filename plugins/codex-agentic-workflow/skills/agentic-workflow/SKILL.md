---
name: "agentic-workflow"
description: "Use automatically for non-trivial Codex engineering work: multi-step tasks, changes across multiple files, risky refactors, debugging with unknown root cause, multi-session work, structured task boards, blockers, handoffs, known issues, verification planning, or explicit agent/subagent/parallel delegation requests."
---

# Agentic Workflow

Use this skill for non-trivial work that benefits from persistent task state,
handoffs, blockers, done criteria, and explicit delegation.

The user does not need to name this skill. If the task is medium or full under
the tier rules below, use this workflow automatically.

## Operating Mode - Codex Orchestrator

Act as the orchestrator for non-trivial work: understand the task, keep state
small, preserve decisions in files, and verify the result.

Codex adaptation:

- Do not spawn subagents unless the user explicitly asks for agents, subagents,
  delegation, or parallel agent work.
- Keep the main thread responsible for the critical path when delegation was
  not explicitly requested.
- Use Codex plans and concise progress updates for local work.
- Use `.localdev/workflow/` for multi-session working state.
- Use `docs/KNOWN_ISSUES.md` for committed, durable project constraints.

## Startup Checklist

At task start, check these files when they exist:

- `.localdev/workflow/blockers.md`
- `.localdev/workflow/handoffs/*.md`
- `.localdev/workflow/todo.md`
- `docs/KNOWN_ISSUES.md`

Only search `.localdev/workflow/done.md` for specific history. Never load it
wholesale because it is append-only and can grow without bound.

Do not dump file contents into chat. Summarize only relevant blockers,
handoffs, known issues, active `[doing]` or `[blocked]` cards, and current
Definition of Done.

If these files are missing and the user is asking for structured workflow,
multi-session coordination, handoffs, blockers, done logs, or durable known
issues, use `init-agentic` first to scaffold them.

## Tier Semantics

- `trivial`: one small answer or one small change. Work locally. No task board
  update unless the user asks.
- `medium`: multi-step work, two or more files, scoped feature work, bug fixes
  with verification, or work likely to need a short plan. Add or update a
  `.localdev/workflow/todo.md` card with verifiable DoD.
- `full`: ambiguous architecture, multiple subsystems, high-risk refactor,
  security-adjacent work, or multi-session task. Use todo, blockers, handoffs,
  known issues, verification, and the done log.

Never make `full` the default. Infer the smallest tier that can still close the
Definition of Done.

## 2-Strike Rule

Each active todo card has `Attempts: N/2`.

After two failed approaches to the same problem, stop trying new fixes. Re-read
the evidence, identify the actual constraint, and re-plan. If the user allowed
delegation, dispatch an auditor/reviewer-style agent to diagnose the root
constraint before continuing.

## Model Capability Tiers

Do not hard-code specific GPT model names in workflow decisions. Codex model
availability changes over time and differs by install.

Use capability tiers instead:

| Tier | Use for |
| --- | --- |
| `fast` | Narrow searches, hook checks, simple test summaries, and mechanical edits. |
| `coding` | Scoped implementation, refactors, and source-level debugging. |
| `reasoning` | Planning, design choices, risk review, and ambiguous tradeoffs. |
| `audit` | Deep diagnosis after repeated failed attempts or high-risk review. |

When a concrete model must be selected, choose the currently available Codex or
GPT model that best matches the tier and required reasoning effort.

## Delegation

When delegation is explicitly allowed, map workflow roles to the closest
available Codex multi-agent tool or role. Role names can vary across installs,
so preserve the intent even when the exact label is unavailable.

| Workflow role | Capability tier | Default use |
| --- | --- | --- |
| Planner | `reasoning` | Brief non-trivial or ambiguous work. |
| Finder | `fast` | Locate files, call chains, and ownership. |
| Researcher | `fast` / `reasoning` | Confirm library, API, CLI, or external behavior. |
| Builder fast | `coding` | Scoped implementation. |
| Builder trivial | `fast` | Mechanical bulk edits. |
| Builder smart | `reasoning` / `coding` | Only after a failed cheaper attempt or for strategy-grade implementation. |
| Reviewer | `reasoning` | Pre-screen implementation before final answer. |
| Tester | `fast` | Run DoD checks and summarize results. |
| Auditor | `audit` | Diagnose after repeated failed attempts or root-cause stalls. |

Use the session model for normal main-thread work. Only route models explicitly
when an agentic workflow with delegation is part of the user request.

## Exploration Flow

Use this order when exploring code:

1. GitNexus first for code graph questions, impact analysis, callers/callees,
   execution-flow discovery, and pre-edit blast radius when `.gitnexus/`
   exists.
2. context-mode for large searches, large files, logs, test output, and any
   command output likely to exceed a short screenful.
3. context7 before asserting library, API, SDK, CLI, or cloud-service behavior.
4. A bounded finder/explorer agent only when the user explicitly allowed
   delegation and graph/context queries did not answer the question.
5. Reasoning-heavy review or planning only after the raw map is condensed.

If an expected MCP/tool call fails, tell the user the exact tool and error.
Label any continued work on a degraded path as degraded.

## Task Board

`.localdev/workflow/todo.md` holds only open cards. Keep it short.

```markdown
# Todo

## [doing] <task title>
- Assignee: main-thread
- Attempts: 0/2
- DoD: <verifiable done criteria>
- Deps: none
```

Status is one of `[todo]`, `[doing]`, or `[blocked]`.

A `[blocked]` card pairs with a full entry in `blockers.md`; the card only
shows board state. When a task completes, remove its card from `todo.md` and
append an entry to `.localdev/workflow/done.md`.

Legacy checkbox ledgers can be migrated on first touch: open items become
`[todo]` or `[doing]` cards, completed items move to `done.md`.

## Blockers

If a decision cannot be resolved from code, docs, tests, tools, or git history,
use the `blocker` skill. Append the blocker, set the task card to `[blocked]`,
stop the current task, and ask the user.

## Handoffs

For work that cannot finish in the current session, use the `handoff` skill.
Capture state, files touched, verification, unresolved risks, and next steps.

When the task completes, absorb any durable value from the handoff into the
matching `done.md` entry and delete the handoff file. A handoff surviving a
completed task is stale state.

## Known Issues

When a platform, dependency, tooling, or environment constraint will affect
future work, use the `known-issue` skill. Known issues belong in
`docs/KNOWN_ISSUES.md` and are intended to be committed.

## Completion

Do not mark a task complete without evidence. The done entry should include the
summary, verification, key files, links when available, and attempt count:

```markdown
## YYYY-MM-DD HH:MM - <task title>
- Summary: <what changed and how it was verified>
- Links: <PR, issue, commit, or none>
- Files: <key paths>
- Attempts: <number>
```
