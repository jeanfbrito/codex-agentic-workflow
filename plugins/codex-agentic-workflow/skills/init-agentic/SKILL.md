---
name: "init-agentic"
description: "Initialize a project's Codex workflow ledgers when setup is requested or ongoing work needs missing task-state files."
---

# Init Agentic

Initialize working state in the current project, preserving existing content.
Use the initializer from this skill's own plugin installation; keep the target
project as the working directory:

```bash
node <plugin-root>/scripts/init-project.mjs
```

Resolve `<plugin-root>` two levels above this skill directory. Use `--no-agents`
when the requested setup should omit an AGENTS.md section.

The initializer creates missing task ledgers and handoffs under
`.localdev/workflow/`, including `.localdev/workflow/done.md`, plus
`docs/KNOWN_ISSUES.md`. It preserves non-empty files, adds the `.localdev/`
ignore rule, and refreshes the marked workflow section in AGENTS.md unless
disabled. It warns when the known-issues document appears ignored.

Use [the ledger reference](../agentic-workflow/references/ledgers.md) for formats
if manual setup is necessary. Initialize only when working state is needed;
an ordinary small edit needs no setup. Report created and preserved paths and
any unresolved constraint. Do not change permission modes or commit as part
of initialization unless separately requested.
