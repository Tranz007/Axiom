# Axiom Cursor Rules

- Inspect `app.ax` before implementing authority-bearing features.
- Update `app.ax` before adding data access, agent tools, external effects, approvals, or audit behavior.
- Run `axiom validate app.ax` after contract changes.
- Do not create implementation paths that bypass declared capabilities.
- Do not let model output decide final policy outcomes.
- Keep sensitive data inside declared broker boundaries.
- Never log raw secrets, plaintext sensitive values, approval tokens, auth headers, or decrypted payloads.
- Prefer narrow capabilities over broad retrieval, export, search-all, or admin-style agent routes.
