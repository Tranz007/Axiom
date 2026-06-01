# Why Axiom

Human developers will reasonably ask:

> Why add another layer? Why not use the languages, frameworks, policy engines, and tests we already have?

That objection is correct. Axiom should not exist unless it removes a class of complexity that current stacks repeatedly push onto humans.

The argument for Axiom is not that Python, TypeScript, Rust, OpenAPI, Rego, workflow engines, or infrastructure-as-code are bad. They are useful. The problem is that agent-built software creates a cross-cutting authority problem that those tools only address in fragments.

## The Complexity Already Exists

Axiom does not invent the complexity.

In agent-facing software, the complexity is already present:

- Which actor is asking?
- Is the actor trusted, authenticated, both, or neither?
- What exact capability is being requested?
- What data class is involved?
- Is the data sensitive?
- Where is the output going?
- Is the destination known or unknown?
- Is the output raw, masked, summarized, tokenized, or task-scoped?
- Does this action require approval?
- What proof binds the approval to the request?
- What side effects are irreversible?
- What must be audited?
- What must never be logged?
- What happens if the agent is prompt-injected?
- What happens if the request is repeated 1,000 times with small variations?

Today, teams usually spread those answers across:

- endpoint code
- middleware
- schema validators
- comments
- design docs
- policy files
- UI copy
- test fixtures
- logging conventions
- threat models
- deployment checklists
- tribal memory

Axiom's claim is simple:

> If the complexity is security-critical, cross-cutting, and easy to forget, it should become source code.

## What Existing Languages Miss

Existing languages can represent the mechanics of a system. They are weaker at representing the authority of a system.

TypeScript can say:

```ts
type UserProfile = {
  legalName: string
  address: string
}
```

But it does not natively say:

```text
this field may only leave the broker as task_fields
this action requires approval when the destination is unknown
this endpoint must not exist for untrusted agents
this UI must show destination trust before approval
this audit event must not contain plaintext
```

You can build those rules manually. Good teams do.

The problem is that each team builds them differently, often after an incident, and often in places future agents cannot reliably inspect.

## The Real Developer Question

The serious question is not:

> Can I build this in TypeScript?

Of course you can.

The serious question is:

> Can the next human or agent understand the authority model, preserve it during changes, and prove that generated code did not drift from it?

Axiom is for that second question.

## When Axiom Is Worth It

Axiom is worth considering when at least two of these are true:

- AI agents call into the system.
- Private, regulated, financial, identity, medical, or business-sensitive data is involved.
- The system can take irreversible external actions.
- Human approval matters.
- Auditability matters.
- A model must not decide access.
- Broad retrieval would be dangerous.
- Repeated low-risk outputs can accumulate into high-risk disclosure.
- Multiple teams or agents will extend the system over time.

In those contexts, Axiom can reduce total system risk by making the authority model explicit.

## When Axiom Is Not Worth It

Axiom is probably not worth it for:

- static marketing pages
- simple public-data dashboards
- toy apps
- local scripts
- basic CRUD over non-sensitive data
- low-level performance-critical systems
- prototypes where no agent, approval, or sensitive effect exists

Using Axiom where it is not needed would be ceremony.

The goal is not to wrap everything in a grand theory.

The goal is to make high-risk agentic software harder to accidentally widen, leak, or misrepresent.

## The Developer Payoff

Axiom should earn its keep by producing practical outputs:

- request and response schemas
- policy matrix tests
- broker contracts
- approval UI requirements
- audit schemas
- route guard checks
- deployment manifests
- verification reports

If Axiom only produces prettier documentation, it fails.

If Axiom produces tests and guardrails that catch dangerous drift before deployment, it starts to justify itself.

## A Concrete Example

Without Axiom, a developer might add:

```http
GET /records/search
```

That looks harmless during a demo. It may even be authenticated.

But in an agent-facing system, that endpoint may quietly become a broad retrieval channel.

With Axiom, the capability source might say:

```text
invariant capability_not_retrieval
  forbid:
    agent_route returns raw_sensitive_record
    agent_route lists all_records
    agent_route searches decrypted_payload
```

The build can reject the route before it ships.

That is not extra complexity for its own sake. That is moving a critical product promise from human memory into executable structure.

## The Right Mental Model

Axiom is not a replacement for existing languages.

It is closer to a constitutional layer:

```text
existing languages describe how the system works
Axiom describes what the system is allowed to do
```

The implementation can still be TypeScript, Python, Rust, React, SQL, OpenAPI, or Rego.

Axiom should make those systems safer to generate, connect, constrain, test, and deploy when agents and sensitive actions are involved.

## The Bar

Axiom should be judged by whether it can answer these questions better than scattered code and docs:

- What can this actor do?
- Why is it allowed?
- What data can it touch?
- What data can leave?
- What requires approval?
- What is forbidden?
- What gets audited?
- What happens when a future agent changes the system?

If it cannot answer those clearly, it should not be added.

