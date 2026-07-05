# Codex Agentic Workflow Plugin

This plugin provides:

- skills for task coordination, blockers, handoffs, and known issues
- `.localdev/workflow/` project task boards and done logs
- Codex/GPT capability-tier role mapping
- model-tier routing guidance for explicit agent workflows
- optional hooks that surface blockers, handoffs, and active todo cards

The plugin does not force subagent delegation. Codex policy requires explicit
user permission before spawning subagents, so the skills use delegation only
when the user asks for agent/subagent/parallel work.

## Install

From the repository root:

```bash
node plugins/codex-agentic-workflow/scripts/link-home-marketplace.mjs
node plugins/codex-agentic-workflow/scripts/validate.mjs
```

Restart Codex or open a new conversation. The available skills should include
`codex-agentic-workflow:init-agentic` and
`codex-agentic-workflow:agentic-workflow`.

Optional hooks:

```bash
node plugins/codex-agentic-workflow/scripts/install-codex-hooks.mjs
```

## Use

In a project, ask Codex to prepare the repo for the agentic workflow. The main
chat should choose `codex-agentic-workflow:init-agentic` automatically when the
workflow files are missing. It bootstraps:

- `.localdev/workflow/todo.md`
- `.localdev/workflow/done.md`
- `.localdev/workflow/blockers.md`
- `.localdev/workflow/findings.md`
- `.localdev/workflow/handoffs/`
- `docs/KNOWN_ISSUES.md`
- `AGENTS.md` with a marked `codex-agentic-workflow` section

The deterministic initializer is:

```bash
node plugins/codex-agentic-workflow/scripts/init-project.mjs
```

Use `--no-agents` if the target project should not receive an `AGENTS.md`
section.

For ongoing work, describe the task normally. The main chat should choose
`codex-agentic-workflow:agentic-workflow` automatically for non-trivial
engineering tasks: multi-step work, multiple files, risky refactors,
unknown-root-cause debugging, multi-session work, blockers, handoffs, known
issues, completion logs, or verification planning.

`todo.md` holds only open cards with `[todo]`, `[doing]`, or `[blocked]`
status. Completed work moves to `.localdev/workflow/done.md`.

Other available skills:

| Skill | Purpose |
| --- | --- |
| `codex-agentic-workflow:blocker` | Record a decision blocker and stop until it is resolved. |
| `codex-agentic-workflow:handoff` | Write a cross-session handoff for unfinished work. |
| `codex-agentic-workflow:known-issue` | Add durable project constraints to `docs/KNOWN_ISSUES.md`. |
| `codex-agentic-workflow:personal-engineering-rules` | Load portable engineering preferences. |

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

You can still name a skill explicitly when debugging discovery or forcing a
specific workflow path.

## Troubleshooting

If `codex-agentic-workflow:init-agentic` or
`codex-agentic-workflow:agentic-workflow` does not appear in a new Codex
conversation, check the marketplace install:

- `~/.agents/plugins/marketplace.json` has a `codex-agentic-workflow` entry.
- The entry's `source.path` points to this plugin directory.
- `.codex-plugin/plugin.json` exists at that path.
- Codex was restarted or a new conversation was opened after install.
