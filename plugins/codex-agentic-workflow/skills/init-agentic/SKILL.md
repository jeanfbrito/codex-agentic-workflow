---
name: "init-agentic"
description: "Scaffold Codex agentic workflow files in the current project: .localdev/workflow/ plus docs/KNOWN_ISSUES.md, without overwriting existing content."
---

# Init Agentic

Set up Codex agentic workflow scaffolding in the current working directory.

## Steps

1. Check current state first. Do not overwrite non-empty files.
2. Create directories:
   - `.localdev/workflow/handoffs/`
   - `docs/`
3. Create missing files:
   - `.localdev/workflow/todo.md`
   - `.localdev/workflow/blockers.md`
   - `.localdev/workflow/findings.md`
   - `docs/KNOWN_ISSUES.md`
4. If inside a git repo, ensure `.localdev/` is ignored in `.gitignore`.
5. Confirm `docs/KNOWN_ISSUES.md` is not ignored.
6. Report created paths, skipped paths, and gitignore status.

## Starter Templates

`.localdev/workflow/todo.md`:

```markdown
# Todo

## Task
<!-- Current task summary. -->

## Definition of Done
<!-- Observable outcomes and verification evidence. -->

## Steps
- [ ] Define the task.
```

`.localdev/workflow/blockers.md`:

```markdown
# Active Blockers

<!-- Entries must start with: ## YYYY-MM-DD HH:MM - <summary> -->
```

`.localdev/workflow/findings.md`:

```markdown
# Findings

Ephemeral discoveries for the current task. Move durable project constraints to
docs/KNOWN_ISSUES.md.
```

`docs/KNOWN_ISSUES.md`:

```markdown
# Known Issues

<!-- Durable project constraints. Include Status, Issue, Workaround, Affects, Ref. -->
```

Do not commit unless the user explicitly asks.
