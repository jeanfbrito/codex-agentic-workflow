# Codex Agentic Workflow

Codex plugin for structured multi-session engineering work.

It provides:

- project task ledger under `.Codex/mytasks/`
- committed known issues under `docs/KNOWN_ISSUES.md`
- decision blockers and handoffs
- agent role guidance mapped to Codex agent roles
- model routing for explicit agent workflows
- lightweight hooks for task-state reminders
- personal engineering rules suitable for a global Codex setup

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
  hooks.json
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

## Validate

```bash
node plugins/codex-agentic-workflow/scripts/validate.mjs
```

## Project Setup

After installing the plugin, ask Codex to run the `init-agentic` skill in a
project. It scaffolds:

- `.Codex/mytasks/todo.md`
- `.Codex/mytasks/blockers.md`
- `.Codex/mytasks/findings.md`
- `.Codex/mytasks/handoffs/`
- `docs/KNOWN_ISSUES.md`

The `.Codex/` directory is local working state and should be gitignored.
`docs/KNOWN_ISSUES.md` is project knowledge and should be committed.
