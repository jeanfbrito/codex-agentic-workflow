---
name: "agentic-workflow"
description: "Use for non-trivial Codex engineering work, task boards, blockers, handoffs, focused verification, and explicitly requested delegation."
---

# Agentic Workflow

Read [the Codex workflow doctrine](../../AGENTIC.md) once when applying this
skill. It is the single source of truth adapted from agentic-workflow-framework.
Do not spawn agents unless the user explicitly requests delegation.

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
