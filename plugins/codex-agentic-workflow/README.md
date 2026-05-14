# Codex Agentic Workflow Plugin

This plugin converts the useful parts of the Agentic Workflow Framework to
Codex:

- skills for task coordination, blockers, handoffs, and known issues
- `.Codex/mytasks/` project working state
- Codex agent role mapping
- model routing for explicit agent workflows
- optional hooks that surface blockers and handoffs

The plugin does not force subagent delegation. Codex policy requires explicit
user permission before spawning subagents, so the skills use delegation only
when the user asks for agent/subagent/parallel work.
