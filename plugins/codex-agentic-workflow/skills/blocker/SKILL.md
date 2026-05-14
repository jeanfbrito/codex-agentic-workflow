---
name: "blocker"
description: "Append a decision blocker to .Codex/mytasks/blockers.md and stop the current task until the user resolves it."
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

## Steps

1. Ensure `.Codex/mytasks/blockers.md` exists.
2. Append a complete entry using the canonical format.
3. Stop the current task.
4. Present the blocker to the user and ask for the decision.
5. When resolved, remove only that blocker entry and continue.

Do not fabricate missing fields. Use `<unknown>` when necessary.
