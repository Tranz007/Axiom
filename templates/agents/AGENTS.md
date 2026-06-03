# Axiom Project Instructions

Before making implementation changes, inspect `app.ax`.

Treat `app.ax` as the authority source for:

- application intent
- actors and agents
- sensitive data classes
- capabilities
- deterministic policy decisions
- approval requirements
- broker boundaries
- external effects
- audit obligations
- invariants

When adding a feature:

1. Update `app.ax` first if the feature changes data access, agent authority, approval behavior, external effects, or audit requirements.
2. Run `axiom validate app.ax`.
3. Run `axiom simulate` for changed capabilities when relevant.
4. Do not create generic retrieval, export, search-all, or raw secret routes for agents unless explicitly modeled and allowed in `app.ax`.
5. Do not let model output decide final access, approval, disclosure mode, or sensitivity.
6. Keep brokered sensitive data inside declared broker boundaries.
7. Never log raw secrets, decrypted payloads, approval tokens, auth headers, or plaintext sensitive records.
8. If a requested change violates `app.ax`, explain the violation and propose a narrower capability or approval-gated flow.

Keep Axiom usage token-aware:

- Prefer `axiom next`, `axiom doctor`, `axiom diff`, and targeted `axiom simulate` output over pasting full Axiom files into chat.
- Do not paste generated artifacts, full reports, or long policy matrices unless the user asks for them.
- Summarize only the changed capability, data class, policy decision, or approval path needed for the task.
- Reference file paths and commands so the agent can re-check locally instead of carrying the whole contract in context.
- If using an external model, keep context small by default. Richer context is acceptable only when the user is using an internal or deployed model that can handle it.

Implementation code may be hand-written, but it must satisfy the Axiom contract.
