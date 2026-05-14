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

## Skills

After installation, open a new Codex conversation. The available skills should
include these entries:

| Skill | Purpose | When to use |
| --- | --- | --- |
| `codex-agentic-workflow:init-agentic` | Bootstrap a project for the workflow. | Run once per project before using the task ledger. |
| `codex-agentic-workflow:agentic-workflow` | Run a structured engineering workflow. | Use for multi-step, risky, or multi-session tasks. |
| `codex-agentic-workflow:blocker` | Record a decision blocker and stop. | Use when progress depends on a user/product/architecture decision. |
| `codex-agentic-workflow:handoff` | Write a cross-session handoff. | Use before stopping unfinished work or passing context to another session. |
| `codex-agentic-workflow:known-issue` | Record durable project constraints. | Use for platform, dependency, tooling, or environment issues that future sessions must know. |
| `codex-agentic-workflow:personal-engineering-rules` | Load portable engineering preferences. | Use in global setup or when a session should follow Jean's engineering rules. |

`init-agentic` is setup. It creates workflow files without overwriting existing
content:

- `.localdev/workflow/todo.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`

`agentic-workflow` is execution. It tells Codex how to classify task size,
maintain `.localdev/workflow/todo.md`, record blockers and handoffs, consult
known issues, verify work, and map workflow roles to Codex agents when the user
explicitly asks for subagents or parallel agent work.

The main chat should use these skills by itself. You do not need to mention the
skill names in normal prompts. The names are useful for debugging, validation,
or forcing a specific path.

Automatic trigger expectations:

- Use `init-agentic` when a project needs workflow setup or when structured
  workflow files are missing.
- Use `agentic-workflow` for non-trivial engineering work: multi-step tasks,
  multiple files, risky refactors, unknown-root-cause debugging, work likely to
  span sessions, or tasks that need blockers, handoffs, known issues, or
  verification planning.
- Use `blocker` when progress depends on a decision that cannot be resolved
  from code, docs, tests, or git history.
- Use `handoff` before stopping unfinished work.
- Use `known-issue` when a durable project constraint should be available to
  future sessions.

## Install

Use this repository as a local Codex plugin marketplace. From the repository
root, run:

```bash
node plugins/codex-agentic-workflow/scripts/link-home-marketplace.mjs
```

That script:

- creates `~/plugins/codex-agentic-workflow` as a symlink to this checkout
- adds `codex-agentic-workflow` to `~/.agents/plugins/marketplace.json`
- writes an absolute plugin path so Codex can discover the plugin from a fresh
  conversation

```bash
node plugins/codex-agentic-workflow/scripts/validate.mjs
```

After install, start a new Codex conversation and check the available skills.
You should see entries like:

- `codex-agentic-workflow:init-agentic`
- `codex-agentic-workflow:agentic-workflow`

If those skills are missing in a new conversation, inspect
`~/.agents/plugins/marketplace.json`. The plugin entry must resolve to a real
directory containing `.codex-plugin/plugin.json`.

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

For a home-local install, also confirm that the marketplace entry resolves:

```bash
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync(process.env.HOME+'/.agents/plugins/marketplace.json','utf8')).plugins.find(p=>p.name==='codex-agentic-workflow').source.path; console.log(p, fs.existsSync(p))"
```

## Project Setup

After installing the plugin, start a new Codex conversation in a project and
ask Codex to run `codex-agentic-workflow:init-agentic`. It scaffolds:

- `.localdev/workflow/todo.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`

The `.localdev/` directory is local working state and should be gitignored.
`docs/KNOWN_ISSUES.md` is project knowledge and should be committed.

For ongoing work, ask Codex to use `codex-agentic-workflow:agentic-workflow`.
That skill keeps blockers, handoffs, known issues, and task-state reminders
aligned with the workflow files.

Typical project flow:

1. Install the plugin from this repository.
2. Open a new Codex conversation so the marketplace and skills are discovered.
3. In the target project, ask Codex to prepare the project for the agentic
   workflow. It should choose `init-agentic`.
4. Commit `docs/KNOWN_ISSUES.md` if it contains useful project knowledge.
5. Add `.localdev/` to `.gitignore` unless the project already ignores it.
6. For real work, describe the task normally. Codex should choose
   `agentic-workflow` when the task is non-trivial.
7. Ask Codex to leave a handoff before ending unfinished work.
8. When a decision is needed before continuing, Codex should record a blocker.

Example prompts:

```text
Prepare this repo for the agentic workflow.
```

```text
Refactor this subsystem and keep track of blockers and verification.
```

```text
Leave a handoff before we stop.
```

```text
Document this environment constraint so future sessions know about it.
```

## Troubleshooting

If `codex-agentic-workflow:init-agentic` or
`codex-agentic-workflow:agentic-workflow` does not appear in a new conversation,
the issue is marketplace discovery or installation, not the skill files.

Check:

- `~/.agents/plugins/marketplace.json` contains a `codex-agentic-workflow`
  entry.
- The entry's `source.path` resolves to a real directory.
- That directory contains `.codex-plugin/plugin.json`.
- The manifest's `skills` path resolves to a directory containing `SKILL.md`
  files.
- Codex was restarted or a new conversation was opened after install.

Run the installer again if needed:

```bash
node plugins/codex-agentic-workflow/scripts/link-home-marketplace.mjs
```

Then validate:

```bash
node plugins/codex-agentic-workflow/scripts/validate.mjs
```
