---
name: "known-issue"
description: "Document a durable project platform, dependency, tooling, or environment constraint in docs/KNOWN_ISSUES.md."
---

# Known Issue

Use this when you discover a constraint future agents or developers would
otherwise rediscover.

## Destination

`docs/KNOWN_ISSUES.md`

## Entry Format

```markdown
## <short issue title>
- Status: Open | Workaround | Fixed
- Issue: <what happens>
- Workaround: <how to proceed>
- Affects: <paths, commands, platforms, or packages>
- Ref: <link, issue, commit, or <unknown>>
```

## Rules

- Create `docs/KNOWN_ISSUES.md` if missing.
- Fill fields from current evidence.
- Do not fabricate.
- Remind the user that this file is durable project knowledge and should be
  committed when appropriate.
