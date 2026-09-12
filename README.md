# Codex Agentic Workflow

Codex plugin for structured multi-session engineering work.

It provides:

- project task board and done log under `.localdev/workflow/`
- committed known issues under `docs/KNOWN_ISSUES.md`
- decision blockers, handoffs, and parseable completion records
- agent role guidance mapped to Codex/GPT capability tiers
- model-tier routing guidance for explicit agent workflows
- lightweight hooks for task-state reminders
- personal engineering rules suitable for a global Codex setup

## Operational Tools

This workflow is designed to work with these tools when they are available:

- **GitNexus** for code graph questions, impact analysis, callers/callees, and
  execution-flow discovery before editing.
- **context-mode** for large file reads, broad searches, logs, test output, and
  any command output that would otherwise flood the model context.
- **context7** for current library, API, SDK, CLI, and cloud-service behavior
  before asserting details or writing briefs.
- **RTK** for short shell commands where token-filtered output is useful and it
  does not conflict with context-mode routing.

Exploration order:

1. Ask GitNexus for graph, flow, and impact context.
2. Use context-mode for large searches, files, logs, and generated output.
3. Use context7 for library, API, SDK, CLI, and cloud-service facts.
4. Use a bounded `finder`/`explorer` task only when the user explicitly allowed
   delegation and remaining exploration is still needed.
5. Reserve reasoning/audit-tier models for planning, review, audit, and
   decisions.

If one of these tools is expected but fails, report the exact tool and error
instead of silently falling back to raw search or memory.

## Model Policy

When the user explicitly asks for subagents or parallel agent work, the plugin
maps workflow roles to capability tiers instead of hard-coded GPT model names.
Choose the currently available Codex/GPT model that best matches the tier and
required reasoning effort.

| Workflow role | Capability tier | Use |
| --- | --- | --- |
| Explore / Finder | `fast` | Narrow searches, file location, simple summaries. |
| Context Builder / Researcher | `fast` or `reasoning` | Source context or current external behavior. |
| Engineer | `coding` | Scoped implementation and refactors. |
| Pair / Review | `reasoning` | Pre-merge review and tradeoff checks. |
| Design / Planner | `reasoning` | Plans, architecture, and ambiguous decisions. |
| Audit | `audit` | Deep diagnosis after failed attempts or high-risk changes. |
| Test | `fast` | DoD verification and concise output summaries. |

## Layout

```
.agents/plugins/marketplace.json
plugins/codex-agentic-workflow/
  .codex-plugin/plugin.json
  scripts/
  templates/
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
| `codex-agentic-workflow:init-agentic` | Bootstrap a project for the workflow. | Run once per project before using the task board. |
| `codex-agentic-workflow:agentic-workflow` | Run a structured engineering workflow. | Use for multi-step, risky, or multi-session tasks. |
| `codex-agentic-workflow:blocker` | Record a decision blocker and stop. | Use when progress depends on a user/product/architecture decision. |
| `codex-agentic-workflow:handoff` | Write a cross-session handoff. | Use before stopping unfinished work or passing context to another session. |
| `codex-agentic-workflow:known-issue` | Record durable project constraints. | Use for platform, dependency, tooling, or environment issues that future sessions must know. |
| `codex-agentic-workflow:personal-engineering-rules` | Load portable engineering preferences. | Use in global setup or when a session should follow Jean's engineering rules. |

`init-agentic` is setup. It creates workflow files without overwriting existing
content:

- `.localdev/workflow/todo.md`
- `.localdev/workflow/done.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`
- a marked `codex-agentic-workflow` section in `AGENTS.md`

The deterministic initializer is:

```bash
node plugins/codex-agentic-workflow/scripts/init-project.mjs
```

Use `--no-agents` if the target project should not receive an `AGENTS.md`
section.

`agentic-workflow` is execution. It tells Codex how to classify task size,
maintain open cards in `.localdev/workflow/todo.md`, append completions to
`.localdev/workflow/done.md`, record blockers and handoffs, consult known
issues, verify work, and map workflow roles to Codex agents when the user
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
- `.localdev/workflow/done.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`
- `AGENTS.md` with a marked `codex-agentic-workflow` section

The `.localdev/` directory is local working state and should be gitignored.
`docs/KNOWN_ISSUES.md` is project knowledge and should be committed.
`todo.md` holds only open cards; completed cards move to `done.md`.

For ongoing work, ask Codex to use `codex-agentic-workflow:agentic-workflow`.
That skill keeps blockers, handoffs, known issues, and task-state reminders
aligned with the workflow files.

Typical project flow:

1. Install the plugin from this repository.
2. Open a new Codex conversation so the marketplace and skills are discovered.
3. In the target project, ask Codex to prepare the project for the agentic
   workflow. It should choose `init-agentic`, which runs
   `scripts/init-project.mjs`.
4. Commit `docs/KNOWN_ISSUES.md` if it contains useful project knowledge.
5. Add `.localdev/` to `.gitignore` unless the project already ignores it.
6. For real work, describe the task normally. Codex should choose
   `agentic-workflow` when the task is non-trivial.
7. Ask Codex to leave a handoff before ending unfinished work.
8. When a decision is needed before continuing, Codex should record a blocker.
9. When a task completes, Codex should remove its todo card and append a
   timestamped `done.md` entry.

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

## Upstream v3 update (Codex 0.4.0)

The current source is `~/Github/agentic-workflow-framework`; exact source hashes
are recorded in `plugins/codex-agentic-workflow/upstream-sync.json`.
The Codex doctrine now lives in the plugin `AGENTIC.md`; the workflow skill is
a thin entry point. It includes continuation on the same agent, bounded scouts,
main-thread server ownership, focused builder proof, and explicit dependencies.
Delegation remains opt-in. Roles now use explicit model assignments; see
`plugins/codex-agentic-workflow/MODEL_ROUTING.md`.

All ten role definitions are in the plugin `agents/` directory, including
`builder-trivial` and `watcher`. Install them with:

```bash
node plugins/codex-agentic-workflow/scripts/install-codex-agents.mjs
node plugins/codex-agentic-workflow/scripts/install-codex-hooks.mjs
```

The hooks now include PreCompact recovery and an advisory Stop ledger audit.
SessionStart includes all open cards under a 4000-character budget and warns
about stale handoffs. Stop recognizes successful native patch/write/edit calls
in Codex transcripts; shell-generated edits and unknown transcript formats are
not covered. It emits a warning and never forces continuation.

Codex hook wire behavior follows [official hook documentation](https://learn.chatgpt.com/docs/hooks).
No blanket permission grants or duplicate context-mode registrations are added.
Start a new conversation to reload role and skill definitions.
