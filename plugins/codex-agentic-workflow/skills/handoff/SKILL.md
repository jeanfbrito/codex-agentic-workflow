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
.localdev/workflow/handoffs/<task-name>.md
```

## Template

```markdown
# <task name>

## Status
<what was done and current state>

## Next
- [ ] <next step>
- [ ] <next step>

## Open questions
<list or "None">

## Files touched
- <path>: <why it matters>
```

Keep the handoff compact. Do not paste raw logs or long diffs.

When the task completes, absorb the durable summary, decisions, links, and key
files into `.localdev/workflow/done.md`, then delete the handoff file.
