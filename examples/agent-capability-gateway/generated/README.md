# Generated Axiom Artifacts

These files were generated from an Axiom source graph.

- `policy-matrix.json`: capability, data, disclosure, policy, broker, and audit matrix
- `capabilities.ts`: generated capability contracts
- `data-classes.ts`: generated sensitive data class contracts
- `audit-events.ts`: generated audit obligations
- `broker-contracts.ts` / `broker-contracts.mjs`: generated broker boundary contracts
- `approval-contracts.ts` / `approval-contracts.mjs`: generated approval payload contracts
- `audit-contracts.ts` / `audit-contracts.mjs`: generated audit payload guards
- `policy-evaluator.ts`: generated deterministic policy evaluator
- `policy-evaluator.mjs`: generated deterministic policy evaluator for plain Node demos
- `runtime-guards.ts`: minimal TypeScript runtime assertions
- `app-skeleton.mjs`: minimal app skeleton that gates policy, approval, broker, and audit behavior
- `app-skeleton.test.mjs`: generated Node tests for the app skeleton guardrails
- `route-skeleton.mjs`: framework-neutral route skeleton with manual auth, broker, audit, persistence, and transport hooks
- `route-skeleton.test.mjs`: generated Node tests proving route guardrails before broker execution
- `axiom-report.md`: validation and generation report

Regenerate with:

```bash
axiom generate <file.ax> --target typescript --out generated
```
