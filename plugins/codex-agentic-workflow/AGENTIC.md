# Agentic Workflow for Codex

Adapted from `~/Github/agentic-workflow-framework/AGENTIC.md` (v3 doctrine).
This is the Codex plugin's single source of workflow guidance. Source hashes
and the adaptation boundary are recorded in `upstream-sync.json`.

## Operating mode

Work locally by default. Spawn subagents only when the user explicitly asks
for delegation or parallel agents. Loading this document is not permission to
delegate. Session instructions and the user's current request take precedence.
Use the available Codex tools, never assume Claude-only tools exist.

For non-trivial work, read relevant open handoffs, blockers, findings, todo
cards, and `docs/KNOWN_ISSUES.md` once. Search historical `done.md` entries
when needed; never load that append-only log wholesale. Keep project working
state under `.localdev/workflow/` and keep `.localdev/` gitignored.

Infer the smallest sufficient tier:

| Tier | Workflow |
| --- | --- |
| trivial | One small answer/change or a fully specified mechanical transform. No routine planning or independent review. |
| medium | Main-thread card and implementation; exact focused DoD checks. No routine planner/reviewer/tester round. |
| full | Ambiguous architecture, risky core changes, or multiple subsystems; plan, implementation, risk review, then combined checks at arc close. |

Create a card for medium/full work. Resolve ordinary choices using existing
authorization. Ask only when an unresolved decision materially affects the
outcome; do not add an approval round for an already authorized next step.

## Async dispatch, when explicitly authorized

- Delegate only concrete bounded work that can run beside useful local work.
  Keep a sole critical-path task local when the runtime cannot run it
  synchronously. Planner/auditor decisions are dependencies, not background work.
- Completion is notification-driven. Do not repeatedly call status or poll on
  a cadence. Use the runtime's wait tool when there is no independent work.
- Continue the same agent on follow-ups and attempt two. In Codex, use
  `followup_task` to resume an idle agent and `send_message` for an active one;
  sending a message alone does not start a new turn on an idle agent.
- Scout briefs name exact files or graph queries, numbered steps, output shape,
  and a tool-call budget (normally at most 12). Return `PARTIAL` at the budget.
  Diagnose a scout silent beyond its expected duration, including permissions,
  before one bounded probe or a narrower restart. Never let it loop indefinitely.
- Assign explicit file ownership. Workers are not alone in the codebase and
  must preserve others' edits. Serialize overlapping or unknown write scopes,
  or use actual isolated worktrees supported by the environment. Codex's
  `spawn_agent` does not imply isolation. Do not pass invented isolation flags.
- On a shared tree, no stash/pop, checkout/reset, or git operation that reverts
  teammates' changes. The main thread owns shared todo/done/findings writes;
  agents return proposed entries. This provides a single writer without relying
  on Claude's `ledger-append.sh` installation.
- Keep long-lived servers in a main-thread-owned process session. A watcher
  handles finite jobs or a bounded logfile digest, never server lifetime or
  polling other agents. Preserve a requested running server after reporting.
- For three or more same-stage agents or a multi-stage fan-out, model explicit
  dependencies and structured result schemas. Use a Workflow tool only if it
  exists and its use is authorized; otherwise use available Codex coordination
  within the concurrency limit. This rule is not a standing tool opt-in.
- Diagnose real approval failures under the active sandbox. Do not install
  blanket permissions or disable approval controls to avoid background stalls.

## Roles and capability tiers

The user authorized explicit role routing. Custom role files set both model
and reasoning effort; the main conversation keeps its selected model.
See [MODEL_ROUTING.md](MODEL_ROUTING.md) for assignments and fallback rules.
Do not replace these assignments with the parent model just because a model
is absent from the advertised override list: Spark passed a live spawn probe.

| Role | Tier | Responsibility |
| --- | --- | --- |
| planner | reasoning | Ambiguous, architectural, risky-core brief; no code or delegation. Skip for clear tasks; no routine re-approval. |
| auditor | audit | Diagnose the root constraint after two failures; redesign before another attempt. |
| builder-fast | coding | Default scoped implementation, including small multi-file changes. Prove its own DoD. |
| builder-smart | reasoning/coding | Failed ordinary implementation or strategy-grade algorithms/concurrency. |
| builder-trivial | fast | One fully specified repetitive transformation across five or more sites. |
| finder | fast | Bounded, read-only code location and call-chain mapping. |
| researcher | fast/reasoning | Primary-source API, library, CLI, and platform evidence. |
| reviewer | reasoning | Risky-arc diff review; at most one focused spot check, no repeated suite. |
| tester | fast | Independent combined proof at arc close, missing builder proof, or explicit request. |
| watcher | fast | Finite noisy command or bounded logfile digest; concise verdict and exact errors. |

Builders report exact commands, outcomes/numbers, touched paths, and remaining
risks. Their proof is the per-card verification. Do not rerun it without a
failure, new change, contradiction, or explicitly requested independent check.

## Two-strike rule

Every active card has `Attempts: N/2`. After the first failed approach, send
the diagnosis to the same builder if delegation is active. At two failed
approaches, stop guessing and identify the root constraint. Use an auditor
only if delegation is authorized; otherwise perform that diagnosis locally.
Re-plan from the evidence. Escalate the model only if capability is the issue.

## Tools and evidence

- Use GitNexus for structural questions and impact in indexed repositories.
  A missing or stale symbol is unknown impact, not proof of safety.
- Use context-mode for processing, aggregation, broad searches, large files,
  and logs. Use native file edits and native shell for mutations and short
  fixed observations. RTK complements, rather than duplicates, context-mode.
- Verify current API/library/CLI behavior through available primary-source
  documentation tools (context7 when available, official web sources otherwise).
  Resolve actual commands before writing a brief; do not invent runners.
- Report tool failures with the exact tool and error. Label evidence gaps and
  any degraded path. Continue independent authorized work where possible.
- Context-mode owns its MCP registration and hooks. Never add duplicates.
- Native Codex memory is primary. Change durable memory only when explicitly
  requested. Do not restore Hindsight or silently promote workflow findings.

## Verification

Name the exact test scope in the DoD, using project instructions, package
scripts, build config, or CI. Use the narrowest check that proves the change.
Full suites require a DoD that names them or a genuinely unknown impact map.
Do not expand checks after the required proof passes without new evidence.

Verify through the real path the user exercises. Mocks and source inspection
are not proof of process lifetime, live app behavior, IPC, or global command
resolution. For UI changes, inspect rendered output. If the runtime cannot be
tested here, report `UNVERIFIED`, the blocker, and precisely what was checked.
Recognize user-only hardware/auth dependencies early and supply exact steps
when necessary. Do not ask the user to run checks that can be run locally.

## Canonical ledgers

`todo.md` contains open cards only:

```markdown
# Todo

## [doing] <task title>
- Assignee: main-thread
- Attempts: 0/2
- DoD: <observable result and exact verification scope>
- Deps: none
```

Status is `[todo]`, `[doing]`, or `[blocked]`. A blocked card pairs with an
entry in `.localdev/workflow/blockers.md`:

```markdown
## YYYY-MM-DD HH:MM - <summary>
- Context: <task and current work>
- Blocker: <decision not resolvable from available evidence>
- What I need: <specific decision>
- Files involved: <paths>
```

Stop only dependent work. Remove resolved blockers. Do not revive stale cards
when the user's latest request changes the task.

Handoffs in `.localdev/workflow/handoffs/<task>.md` have Status, Next, Open
questions, and Files touched sections. On completion, absorb their durable
value into the done entry and remove only the completed task's handoff.

Remove completed cards and append to `.localdev/workflow/done.md`:

```markdown
## YYYY-MM-DD HH:MM - <task title>
- Summary: <what changed and how verified; explicit runtime limits>
- Links: <PR, issue, commit, or none>
- Files: <key paths>
- Attempts: <number>
```

`findings.md` is temporary shared evidence. Preserve useful findings in a
handoff before cleaning up; never erase another active task's findings.
Persistent project constraints belong in `docs/KNOWN_ISSUES.md`, with status,
workaround, affected files, and reference. Do not commit or push unless asked.

## Codex hooks

- SessionStart: budgeted digest (at most 4000 characters), ordered recovery,
  pending audit, blockers, all open cards plus Attempts/DoD, then handoff age.
  Warn on handoffs older than seven days. No-op outside initialized projects.
- PreCompact: snapshot doing/blocked cards per session. On compact/resume
  within 24 hours, warn to inspect live agents before dispatching again.
- Stop: advisory ledger audit of successful native patch/write/edit calls in
  the available transcript, unfinished cards, and blocker inconsistency.
  Uses Codex `systemMessage`, not Claude-only Stop additional-context fields.
  Never blocks completion. Unknown transcript formats or shell-generated edits
  are not claimed as covered. Pending findings are delivered at next startup.
- UserPromptSubmit: short task-state reminder and pointer to this document.

Hook scratch files are session-scoped to avoid consuming another session's
snapshot. Hook installation preserves unrelated registrations and permissions.
Reload the Codex conversation after installing updated roles and skills.

## Quick side questions

Use the `qq` skill for a concise, read-only side answer. Keep the main task
active. Reuse an existing side agent only if delegation was explicitly asked
for; otherwise answer in the main thread. Do not change the session model.
