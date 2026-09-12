---
name: "agentic-workflow"
description: "Use for non-trivial Codex engineering work, task boards, blockers, handoffs, focused verification, and explicitly requested delegation."
---

# Agentic Workflow

Read [the Codex workflow doctrine](../../AGENTIC.md) once when applying this
skill. It is the single source of truth adapted from agentic-workflow-framework.
Do not spawn agents unless the user explicitly requests delegation.

Apply the doctrine's Execution budget to the main thread and every delegated
brief: reuse known context, make one bounded discovery pass, return concise
derived tool output, patch directly, and stop after the focused DoD passes.
Before exceeding three discovery calls, identify the unresolved question that
justifies the next lookup. Do not create temporary installers for ordinary edits.

Keep open cards in `.localdev/workflow/todo.md` and completions in
`.localdev/workflow/done.md`. A minimal open card is:

```markdown
## [doing] <task title>
- Assignee: main-thread
- Attempts: 0/2
- DoD: <observable result and exact focused check>
- Deps: none
```

For medium work, implement and prove the DoD without a routine planner,
reviewer, or tester round. Reuse agents on retries when delegation is allowed.
Mark blocked runtime verification explicitly as `UNVERIFIED`.
