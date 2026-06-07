# Axiom Project Instructions

Use Axiom before writing implementation code.

Create or update `app.ax` as the readable contract authority for this app's intent, actors, sensitive data, capabilities, policy, approvals, external effects, broker behavior, and audit obligations.

Do not add routes, tools, background jobs, or UI actions that bypass `app.ax`.

If the app handles private data, money, identity, credentials, documents, messages, health data, business data, government data, or irreversible external actions, define narrow capabilities and deterministic policy before implementing those actions.

Models may help draft code and summaries, but models must not make final allow, deny, approval, sensitivity, or disclosure decisions.

Run Axiom validation and explain any errors before continuing.

Keep context small. Use `axiom next`, `axiom doctor`, `axiom diff`, and targeted simulations instead of pasting full contracts, generated artifacts, or reports. Summarize only the changed capability, data class, policy decision, or approval path needed for the current task. If using an external model, avoid filling the context window with Axiom files; richer context is only appropriate for internal or deployed models that can absorb it.
