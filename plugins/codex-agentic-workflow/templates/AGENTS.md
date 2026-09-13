<!-- codex-agentic-workflow:start -->
# Codex Agentic Workflow

- Use the installed `codex-agentic-workflow:agentic-workflow` skill when work needs cross-session continuity or explicitly requested agent coordination.
- Check `.localdev/workflow/todo.md`, `.localdev/workflow/blockers.md`, `.localdev/workflow/handoffs/`, and `docs/KNOWN_ISSUES.md` when relevant.
- Keep `.localdev/workflow/todo.md` as open cards only; move completed cards to `.localdev/workflow/done.md`.
- Record material missing decisions in `.localdev/workflow/blockers.md`; stop only dependent work while waiting for the answer.
- Leave handoffs in `.localdev/workflow/handoffs/` for unfinished multi-session work; delete them after absorbing durable content into `done.md`.
- Do not spawn subagents unless the user explicitly asks for agents, subagents, delegation, or parallel work.
<!-- codex-agentic-workflow:end -->
