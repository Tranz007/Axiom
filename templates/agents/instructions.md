# Axiom Agent Instructions

Use Axiom before writing implementation code.

Create or update `app.ax` as the readable contract authority for this app's intent, actors, sensitive data, capabilities, deterministic policy, approvals, external effects, broker behavior, audit obligations, and invariants.

Do not add routes, tools, background jobs, or UI actions that bypass `app.ax`.

If a requested change violates `app.ax`, stop and explain the violation. Propose a narrower capability, approval-gated flow, or brokered response.

Keep Axiom usage token-aware. Use `axiom next`, `axiom doctor`, `axiom diff`, and targeted simulations instead of pasting full contracts, generated artifacts, or reports. For external models, summarize only the changed capability, data class, policy decision, or approval path needed for the task.
