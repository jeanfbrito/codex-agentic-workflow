---
name: "agentic-workflow"
description: "Manage Codex task ledgers and handoffs for work spanning sessions, plus explicitly requested agent coordination."
---

# Agentic Workflow

Reuse [the Codex workflow](../../AGENTIC.md) if already loaded; otherwise read it
once when this workflow applies. Handle a self-contained edit directly without
a routine planning or agent pipeline. Delegate only on the user's explicit request.

Use [ledger formats](references/ledgers.md) when recording or resuming work, and
[delegation guidance](references/delegation.md) when coordinating authorized agents.
Keep open cards in `.localdev/workflow/todo.md` and completion evidence in
`.localdev/workflow/done.md`. A minimal card is:

```markdown
## [doing] <task title>
- Assignee: main-thread
- Attempts: 0/2
- DoD: <observable result and exact focused check>
- Deps: none
```

Continue through the requested outcome and focused checks under existing
authorization. Report any required check that cannot run as `UNVERIFIED`.
