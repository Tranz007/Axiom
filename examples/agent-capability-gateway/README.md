# Agent Capability Gateway Example

This example demonstrates Axiom's first useful target: narrow capability contracts for external agents.

Run:

```bash
npm run axiom -- validate examples/agent-capability-gateway/axiom.ax
npm run axiom -- matrix examples/agent-capability-gateway/axiom.ax
npm run axiom -- simulate examples/agent-capability-gateway/axiom.ax --capability fill_tax_identity_fields --fact standing_policy_absent=true
npm run axiom -- generate examples/agent-capability-gateway/axiom.ax --target typescript --out examples/agent-capability-gateway/generated
```

The generated folder contains a policy matrix, TypeScript capability contracts, data class contracts, audit obligations, a deterministic policy evaluator, runtime guard helpers, and a verification report.
