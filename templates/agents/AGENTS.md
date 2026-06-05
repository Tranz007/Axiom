# Axiom Project Instructions

Before making implementation changes, inspect `app.ax`.

## First Agent Loop

Use this loop when you enter the project:

1. Run `axiom doctor`.
2. Run `axiom next`.
3. If simulations are recommended, run `axiom simulate-examples`.
4. If generation is recommended, run `axiom generate app.ax --target typescript --out generated`.
5. If policy tests are recommended, run `axiom generate-tests app.ax --examples axiom/simulations.json --out generated-tests`, then `node --test generated-tests/axiom-policy.test.mjs`.

Do not skip straight to app generation. Axiom is here to keep the contract, simulations, generated artifacts, and implementation code aligned.

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
3. Run targeted `axiom simulate` commands for changed capabilities when relevant.
4. Regenerate artifacts or generated policy tests when `axiom next` says they are missing or stale.
5. Do not create generic retrieval, export, search-all, or raw secret routes for agents unless explicitly modeled and allowed in `app.ax`.
6. Do not let model output decide final access, approval, disclosure mode, or sensitivity.
7. Keep brokered sensitive data inside declared broker boundaries.
8. Never log raw secrets, decrypted payloads, approval tokens, auth headers, or plaintext sensitive records.
9. If a requested change violates `app.ax`, explain the violation and propose a narrower capability or approval-gated flow.

Keep Axiom usage token-aware:

- Prefer `axiom next`, `axiom doctor`, `axiom diff`, and targeted `axiom simulate` output over pasting full Axiom files into chat.
- Do not paste generated artifacts, full reports, or long policy matrices unless the user asks for them.
- Summarize only the changed capability, data class, policy decision, or approval path needed for the task.
- Reference file paths and commands so the agent can re-check locally instead of carrying the whole contract in context.
- If using an external model, keep context small by default. Richer context is acceptable only when the user is using an internal or deployed model that can handle it.

Implementation code may be hand-written, but it must satisfy the Axiom contract.
