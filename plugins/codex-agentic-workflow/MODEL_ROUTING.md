# Role model routing

User-authorized routing, 2026-09-12. Spark means GPT-5.3-Codex-Spark,
not the distinct GPT-5.3-Codex model.

| Role | Model | Reasoning |
| --- | --- | --- |
| finder | `gpt-5.3-codex-spark` | low |
| watcher | `gpt-5.3-codex-spark` | low |
| builder-trivial | `gpt-5.3-codex-spark` | medium |
| tester | `gpt-5.3-codex-spark` | medium |
| researcher | `gpt-5.6-terra` | medium |
| builder-fast | `gpt-5.6-terra` | high |
| reviewer | `gpt-5.6-sol` | high |
| planner | `gpt-5.6-sol` | high |
| builder-smart | `gpt-6-astra` | high |
| auditor | `gpt-6-astra` | high |

Spark handles bounded text/code tasks to use the user's separate Spark
allowance. This configuration does not measure or guarantee quota accounting.
Keep test design, difficult failures, and visual verification with a stronger
role; tester runs specified checks and reports results. Watcher handles finite
jobs and log summaries. Keep Spark briefs small and avoid whole-session forks.

For a narrow targeted fix, builder-trivial may use Spark when the transform is
fully specified. General implementation stays with builder-fast on Terra.
If Spark is unavailable, quota-limited, or the task requires images, report the
reason and use an appropriate available role/model. Luna is a suitable fallback
for simple text tasks; Terra for deeper interpretation. Do not silently fall
back to the expensive main-session model. A custom agent file takes precedence
over explicit spawn model overrides, so use a suitable different role or a
default agent with a bounded brief when changing the model.

Both plugin agents/ and ~/.codex/agents/ contain these settings. The existing
install-codex-agents.mjs installer preserves the assignments on reinstall.
Start a new conversation to reload custom-role configuration.

Validation: the earlier explicit Spark spawn returned SPARK_PROBE_OK. This
proved basic execution, not comparative performance or separate quota charging.
The routing installer validates TOML, expected model/effort, and source/install
agreement. No new paid model probes are needed for this configuration edit.

Reference: [Codex custom agent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
