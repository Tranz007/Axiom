# Customer Support Action Example

This example shows a common business workflow: a support agent can draft replies and request refunds, but private customer data and irreversible actions stay behind policy, approval, broker, and audit boundaries.

It is intentionally small. The goal is to show how Axiom makes an agent-facing support feature explicit before framework code is written.

## What It Models

- A support agent may draft a reply for an assigned ticket.
- A support lead must approve refund credits.
- Customer profile and billing data are high sensitivity.
- Brokers may touch raw data, but implementation code receives only summaries, masked values, or tokenized references.
- Audit proves what happened without storing raw customer or payment data.

## Try It

```bash
node ./bin/axiom.mjs validate examples/customer-support-action/axiom.ax
node ./bin/axiom.mjs matrix examples/customer-support-action/axiom.ax
node ./bin/axiom.mjs simulate examples/customer-support-action/axiom.ax --capability draft_customer_reply --fact agent_assigned_to_ticket=true --fact customer_matches_ticket=true --fact reply_goal_in_scope=true
node ./bin/axiom.mjs simulate examples/customer-support-action/axiom.ax --capability issue_refund_credit --fact refund_requested=true
node examples/customer-support-action/app/policy-demo.mjs
node --test examples/customer-support-action/generated/app-skeleton.test.mjs
```

The demo prints three deterministic decisions: allow, require approval, and deny.

The generated skeleton test proves that the contract also produces app-facing guardrails:

- broker responses reject forbidden raw fields
- audit payloads reject forbidden sensitive fields
- approval payloads must include the bound request context
- approval-required policy paths do not execute without valid approval
