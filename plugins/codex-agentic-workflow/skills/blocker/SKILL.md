---
name: "blocker"
description: "Append a decision blocker to .localdev/workflow/blockers.md, mark the active todo card blocked, and stop the current task until the user resolves it."
---

# Blocker

Use this when the current task requires a user decision that cannot be resolved
from code, docs, tests, or git history.

## Canonical Format

Every entry must start with this H2 shape:

```markdown
## YYYY-MM-DD HH:MM - <summary>
- Context: <current task and what you were doing>
- Blocker: <what cannot be resolved>
- What I need: <decision needed from the user>
- Files involved: <paths or <unknown>>
```

The H2 must start with `## ` followed by a four-digit year. Hooks use that
shape to detect active blockers.

## Steps

1. Ensure `.localdev/workflow/blockers.md` exists.
2. Append a complete entry using the canonical format.
3. If `.localdev/workflow/todo.md` has the active task, set its card status to
   `[blocked]`.
4. Stop the current task.
5. Present the blocker to the user and ask for the decision.
6. When resolved, remove only that blocker entry, move the card back to
   `[doing]`, and continue.

Do not fabricate missing fields. Use `<unknown>` when necessary.
