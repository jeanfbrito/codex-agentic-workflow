---
name: "handoff"
description: "Write a cross-session handoff under .localdev/workflow/handoffs/ for unfinished or multi-session work."
---

# Handoff

Use this when work must continue in another session or another agent needs a
compact state snapshot.

## File Path

Write to:

```
.localdev/workflow/handoffs/<yyyy-mm-dd>-<slug>.md
```

## Template

```markdown
# <task name>

## Status
<current state: not started | in progress | blocked | ready for verification>

## Goal
<what the task is trying to achieve>

## Completed
- <concrete completed item>

## Current State
<what is true right now>

## Files Touched
- <path>: <why it matters>

## Verification
- <command or evidence>: <result>

## Open Questions
- <question or none>

## Next Steps
- [ ] <next action>
```

Keep the handoff compact. Do not paste raw logs or long diffs.
