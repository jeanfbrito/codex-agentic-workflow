# Codex Agentic Workflow Plugin

This plugin provides:

- skills for task coordination, blockers, handoffs, and known issues
- `.localdev/workflow/` project working state
- Codex agent role mapping
- model routing for explicit agent workflows
- optional hooks that surface blockers and handoffs

The plugin does not force subagent delegation. Codex policy requires explicit
user permission before spawning subagents, so the skills use delegation only
when the user asks for agent/subagent/parallel work.
