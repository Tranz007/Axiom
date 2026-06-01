# Axiom Agent Instructions

Use Axiom before writing implementation code.

Create or update `app.ax` as the source of truth for this app's intent, actors, sensitive data, capabilities, deterministic policy, approvals, external effects, broker behavior, audit obligations, and invariants.

Do not add routes, tools, background jobs, or UI actions that bypass `app.ax`.

If a requested change violates `app.ax`, stop and explain the violation. Propose a narrower capability, approval-gated flow, or brokered response.
