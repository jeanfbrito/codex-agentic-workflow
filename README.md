# Codex Agentic Workflow

Codex-native adaptation of Jean Brito's Agentic Workflow Framework gist.

This repo is intentionally not a byte-for-byte Claude Code port. It keeps the
parts that work in Codex:

- project task ledger under `.Codex/mytasks/`
- committed known issues under `docs/KNOWN_ISSUES.md`
- decision blockers and handoffs
- agent role guidance mapped to Codex agent roles
- lightweight hooks for task-state reminders
- personal engineering rules suitable for a global Codex setup

It does not install Claude-specific files:

- no `~/.claude/AGENTIC.md`
- no Claude slash commands
- no Claude agent definitions
- no Claude-only orchestrator hook

For graph-style code intelligence, use GitNexus separately when it is available.

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
