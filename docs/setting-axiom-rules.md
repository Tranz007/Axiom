# Setting Axiom Rules

Axiom is set by editing the contract file: `app.ax`.

The human decides what the app should be allowed to do. The coding agent can help write the contract, but the contract is checked by Axiom commands before implementation code is trusted.

## The Short Answer

```bash
axiom define --guided
```

This creates `axiom/contract-outline.md`, a plain-language worksheet for the first contract or the next contract update.

Then ask the coding agent to:

```text
Update app.ax from axiom/contract-outline.md, then run axiom validate app.ax, axiom doctor, and axiom next.
```

## First Contract

For a new project:

```bash
axiom init --template local-private-app --agent codex
axiom define --guided
```

Fill in the outline with:

- what the app is for
- who can use it
- whether an AI agent can act inside it
- what sensitive or important data exists
- what narrow actions are allowed
- what needs approval
- what must never happen
- what must be audited

The agent then turns that outline into `app.ax`.

## Updating Later

Run the same command again when the app changes:

```bash
axiom define --guided --force
```

If `app.ax` already exists, the outline includes a short current-contract summary:

- app name
- number of actors
- number of data classes
- number of capabilities
- current validation state

Use that summary to describe what changed rather than starting over.

## Why Axiom Does Not Auto-Merge Yet

Axiom intentionally does not rewrite an existing `app.ax` from vague answers in this first version.

Contract changes are safety-sensitive. A bad automatic merge could silently expand what an agent or app is allowed to do. The safer open-source path is:

1. Human describes the desired rules in plain language.
2. Agent updates `app.ax`.
3. Axiom validates the contract.
4. Simulations and generated tests prove expected allow, approval, and deny paths.

## Example

Plain-language outline:

```text
Allowed capability: issue a refund credit for one support ticket
Approval required: refund requested or refund amount needs review
Must never happen: agent approves its own refund, raw payment method leaves broker
Audit: policy decision, approval state, refund amount bucket, never raw payment method
```

Contract shape:

```text
capability issue_refund_credit
  purpose:
    issue a customer refund credit only when approval and policy limits match the request

  policy:
    allow if approval_valid
      and refund_amount_within_policy
      and destination_matches_approval

    require_approval if refund_requested
      or refund_amount_needs_review

    deny if approval_missing
      or refund_amount_exceeds_limit
      or agent_approves_own_refund
```

That is how a user sets Axiom: describe the rules, update `app.ax`, and let Axiom check the result.
