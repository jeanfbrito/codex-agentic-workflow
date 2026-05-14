# Codex Agentic Workflow

Codex plugin for structured multi-session engineering work.

It provides:

- project task ledger under `.localdev/workflow/`
- committed known issues under `docs/KNOWN_ISSUES.md`
- decision blockers and handoffs
- agent role guidance mapped to Codex agent roles
- model routing for explicit agent workflows
- lightweight hooks for task-state reminders
- personal engineering rules suitable for a global Codex setup

## Operational Tools

This workflow is designed to work with these tools when they are available:

- **GitNexus** for code graph questions, impact analysis, callers/callees, and
  execution-flow discovery before editing.
- **context-mode** for large file reads, broad searches, logs, test output, and
  any command output that would otherwise flood the model context.
- **RTK** for short shell commands where token-filtered output is useful and it
  does not conflict with context-mode routing.

Exploration order:

1. Ask GitNexus for graph, flow, and impact context.
2. Use context-mode for large searches, files, logs, and generated output.
3. Use a bounded `finder`/`explorer` task for remaining code exploration.
4. Reserve GPT-5.5 for planning, review, audit, and decisions.

## Model Policy

When the user explicitly asks for subagents or parallel agent work, the plugin
maps workflow roles to Codex models:

| Workflow role | Model |
| --- | --- |
| Explore | GPT-5.4 Mini, medium reasoning |
| Context Builder | GPT-5.3 Codex, medium reasoning |
| Engineer | GPT-5.3 Codex, medium reasoning |
| Pair / Review | GPT-5.5, high reasoning |
| Design / Planner | GPT-5.5, medium reasoning |
| Audit | GPT-5.5, high reasoning |
| Test | GPT-5.4 Mini, medium reasoning |

## Layout

```
.agents/plugins/marketplace.json
plugins/codex-agentic-workflow/
  .codex-plugin/plugin.json
  scripts/
  skills/
    agentic-workflow/
    init-agentic/
    blocker/
    handoff/
    known-issue/
    personal-engineering-rules/
```

## Install

Use this repository as a local Codex plugin marketplace. The marketplace entry
points at `./plugins/codex-agentic-workflow`.

If your Codex setup expects home-local plugins, run:

```bash
node plugins/codex-agentic-workflow/scripts/link-home-marketplace.mjs
```

That script creates a symlink at `~/plugins/codex-agentic-workflow` and adds a
matching entry to `~/.agents/plugins/marketplace.json`.

Optional hooks can be installed into `~/.codex/hooks.json`:

```bash
node plugins/codex-agentic-workflow/scripts/install-codex-hooks.mjs
```

The hook installer uses absolute paths to this checkout and preserves existing
Codex hooks.

## Validate

```bash
node plugins/codex-agentic-workflow/scripts/validate.mjs
```

## Project Setup

After installing the plugin, ask Codex to run the `init-agentic` skill in a
project. It scaffolds:

- `.localdev/workflow/todo.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`

The `.localdev/` directory is local working state and should be gitignored.
`docs/KNOWN_ISSUES.md` is project knowledge and should be committed.
