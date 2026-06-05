# Generated Axiom Artifacts

These files were generated from an Axiom source graph.

- `policy-matrix.json`: capability, data, disclosure, policy, broker, and audit matrix
- `capabilities.ts`: generated capability contracts
- `data-classes.ts`: generated sensitive data class contracts
- `audit-events.ts`: generated audit obligations
- `policy-evaluator.ts`: generated deterministic policy evaluator
- `policy-evaluator.mjs`: generated deterministic policy evaluator for plain Node demos
- `runtime-guards.ts`: minimal TypeScript runtime assertions
- `axiom-report.md`: validation and generation report

Regenerate with:

```bash
axiom generate <file.ax> --target typescript --out generated
```
