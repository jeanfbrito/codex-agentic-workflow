# Codex Agentic Workflow Plugin

This plugin converts the useful parts of the Agentic Workflow Framework to
Codex:

- skills instead of Claude slash commands
- `.Codex/mytasks/` instead of `.claude/mytasks/`
- Codex agent role mapping instead of Claude model tiers
- optional hooks that surface blockers and handoffs

The plugin does not force subagent delegation. Codex policy requires explicit
user permission before spawning subagents, so the skills use delegation only
when the user asks for agent/subagent/parallel work.
