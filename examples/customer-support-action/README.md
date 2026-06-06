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
node examples/customer-support-action/app/support-mini-app.mjs
node --test examples/customer-support-action/generated/app-skeleton.test.mjs
node --test examples/customer-support-action/generated/route-skeleton.test.mjs
node --test examples/customer-support-action/generated/approval-ui.test.mjs
node --test examples/customer-support-action/generated/integration-contracts.test.mjs
node --test examples/customer-support-action/app/support-mini-app.test.mjs
```

The policy demo prints three deterministic decisions: allow, require approval, and deny.

The mini app runs one approval-backed refund path:

- a refund request returns `approval_required` before broker execution
- the generated approval model exposes the bound approval fields
- a valid approval resumes the route and executes the broker once
- a deny decision still returns before broker execution
- the hand-written audit hook receives the generated audit event

The generated skeleton test proves that the contract also produces app-facing guardrails:

- broker responses reject forbidden raw fields
- audit payloads reject forbidden sensitive fields
- approval payloads must include the bound request context
- approval-required policy paths do not execute without valid approval

The generated route skeleton test proves the same guardrails at the route boundary:

- deny decisions return before broker execution
- approval-required decisions return before broker execution
- approval payloads must carry required binding fields
- broker responses and audit payloads reject forbidden sensitive fields

The generated approval and integration tests prove the first UI/backend bridge:

- approval review models expose all binding fields before a human approves
- missing binding fields block approval completion
- auth, broker, audit, approval persistence, and transport hooks remain manual and explicit
