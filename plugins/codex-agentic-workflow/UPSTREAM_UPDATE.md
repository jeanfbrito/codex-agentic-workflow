# Agentic workflow update - 2026-09-12

Updated the active Codex integration to plugin version 0.4.0 using the local
`/Users/jean/Github/agentic-workflow-framework` checkout (upstream manifest
0.3.0, v3 workflow doctrine). No network pull or Claude installation was used.
`upstream-sync.json` records exact SHA-256 hashes of the source doctrine,
ten upstream roles, and personal engineering rules.

## Changes

- One Codex `AGENTIC.md` doctrine with a thin workflow skill entry point.
- Same-agent continuation, bounded scouts, explicit write ownership, serialized
  shared ledgers, main-thread server ownership, and precise per-card proof.
- Ten updated installed roles, including new `builder-trivial` and `watcher`.
  Removed obsolete task-directory instructions from the installed roles.
- New `qq` skill for read-only side questions.
- SessionStart includes all open cards under a 4000-character budget and
  handoff-age warnings. PreCompact captures session-scoped active cards.
- Advisory Stop audits native successful edits and ledger consistency, writes
  a session-scoped pending warning, and never forces a continuation.
- Native Codex memory still requires an explicit user request for changes.
- Preserved opt-in delegation, inherited models, existing sandbox policy,
  unrelated hooks, and context-mode's ownership of its registrations.

## Verification

- 48 existing integration checks passed after updating the expected backlog
  behavior to match upstream's all-open-card digest.
- 15 lifecycle regression checks passed through actual Node hook subprocesses:
  no-project no-op, budget, all open cards, stale handoff, session isolation,
  compact/resume recovery, one-time consumption, startup cleanup, successful
  edit audit, denied-edit exclusion, audit delivery, loop guard, and blockers.
- All ten installed role TOML files parsed with the expected identity and
  canonical workflow paths.
- Exactly one framework registration exists for each of SessionStart,
  UserPromptSubmit, PreCompact, and Stop.

Repeat the focused checks from the integration repository:

```bash
node plugins/codex-agentic-workflow/scripts/validate.mjs
node plugins/codex-agentic-workflow/scripts/check-lifecycle.mjs
```

## Boundaries

The lifecycle tests use synthetic project/transcript fixtures. Role discovery
and skill refresh in a newly opened Codex conversation were not exercised.
Start a new conversation to load the updated role and skill definitions.

Stop uses the supported Codex `systemMessage` warning format. It recognizes
native patch/write/edit transcript calls with successful outputs. Shell-based
edits and unknown transcript formats are not covered; transcript data is not
a stable public API. No claim of full Claude hook parity is made.

Codex does not receive Claude model aliases, automatic delegation, invented
Workflow/isolation parameters, or blanket background-agent permission grants.
The main thread owns shared ledger appends, replacing the upstream concurrent
append-helper contract. The installed context-mode plugin remains unchanged.

Source API reference: [official Codex hook documentation](https://learn.chatgpt.com/docs/hooks).
GitNexus returned `Target 'activeTodoCards' not found`, `Target 'compact' not
found`, and `Target 'field' not found`; graph impact remains UNKNOWN. The hook
and validator source plus focused runtime checks supplied the bounded evidence.

## Backups

- Integration files and hooks: `/Users/jean/.codex/backups/agentic-update-1789241140142`
- Previous installed roles: `/Users/jean/.codex/backups/agentic-roles-1789241140200`

The Godot project source and existing task card were not changed. No commit
or push was made, and no durable memory was updated.
