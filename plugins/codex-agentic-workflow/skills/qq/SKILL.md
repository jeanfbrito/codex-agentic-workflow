---
name: qq
description: "Answer a quick read-only side question while preserving the active task; reuse a side agent only when delegation is explicitly requested."
---

# Quick side question

Answer the user's side question concisely using the existing context. Keep
the main task and its state intact. Do not edit project files or change the
session model. If the user explicitly asks for delegation, reuse the same
side agent for follow-ups with `followup_task`; otherwise answer locally.
Use primary sources for facts requiring current verification.
