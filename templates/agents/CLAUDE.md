# Axiom Project Instructions

Use Axiom before writing implementation code.

Create or update `app.ax` as the source of truth for this app's intent, actors, sensitive data, capabilities, policy, approvals, external effects, broker behavior, and audit obligations.

Do not add routes, tools, background jobs, or UI actions that bypass `app.ax`.

If the app handles private data, money, identity, credentials, documents, messages, health data, business data, government data, or irreversible external actions, define narrow capabilities and deterministic policy before implementing those actions.

Models may help draft code and summaries, but models must not make final allow, deny, approval, sensitivity, or disclosure decisions.

Run Axiom validation and explain any errors before continuing.
