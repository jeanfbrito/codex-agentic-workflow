---
name: "init-agentic"
description: "Use automatically when a project needs Codex agentic workflow setup, persistent task board files, .localdev/workflow/, docs/KNOWN_ISSUES.md, handoff/blocker/done-log scaffolding, or when agentic-workflow is requested but the workflow files are missing. Scaffold files without overwriting existing content."
---

# Init Agentic

Set up Codex agentic workflow scaffolding in the current working directory.

Trigger this skill without waiting for the user to name it when the user asks to
prepare, initialize, install, enable, or start a structured/agentic workflow in a
project and the workflow files are missing.

## Steps

Prefer the deterministic initializer script from this plugin:

```bash
node plugins/codex-agentic-workflow/scripts/init-project.mjs
```

Use `--no-agents` only when the target project should not receive an AGENTS.md
section:

```bash
node plugins/codex-agentic-workflow/scripts/init-project.mjs --no-agents
```

The script:

1. Checks current state first and preserves existing non-empty files.
2. Creates directories:
   - `.localdev/workflow/handoffs/`
   - `docs/`
3. Creates missing files:
   - `.localdev/workflow/todo.md`
   - `.localdev/workflow/done.md`
   - `.localdev/workflow/blockers.md`
   - `.localdev/workflow/findings.md`
   - `docs/KNOWN_ISSUES.md`
4. Ensures `.localdev/` is ignored in `.gitignore`.
5. Adds or refreshes a marked `codex-agentic-workflow` section in `AGENTS.md`.
6. Warns if `docs/KNOWN_ISSUES.md` appears to be ignored.

If the script is unavailable, perform the same steps manually.

## Starter Templates

`.localdev/workflow/todo.md`:

```markdown
# Todo

## [todo] Define current task
- Assignee: main-thread
- Attempts: 0/2
- DoD: Define observable done criteria and verification evidence.
- Deps: none
```

`.localdev/workflow/done.md`:

```markdown
# Done

<!-- Append completed task entries. Never load this file wholesale. -->
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
docs/KNOWN_ISSUES.md. Delete on session close when no longer useful.
```

`docs/KNOWN_ISSUES.md`:

```markdown
# Known Issues

<!-- Durable project constraints. Include Status, Issue, Workaround, Affects, Ref. -->
```

Do not commit unless the user explicitly asks.
