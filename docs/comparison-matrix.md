# Axiom Comparison Matrix

**Purpose:** Explain what Axiom is by comparing it against existing languages, frameworks, and adjacent systems.  
**Audience:** future builder, reviewer, agent, or investor trying to understand why Axiom is different.  
**Status:** concept documentation.

## Short Definition

Axiom is not meant to compete with Python, TypeScript, Rust, SQL, or React as a normal implementation language.

Axiom sits above them.

It is an AI-native application specification, verification, and enforcement language where the source of truth is not just code, but a graph of:

- intent
- actors
- capabilities
- sensitive data classes
- trust boundaries
- deterministic policy
- brokered effects
- approval gates
- audit obligations
- invariants
- deployment constraints

Axiom should eventually compile those contracts into ordinary code, tests, policy artifacts, UI requirements, runtime guards, and deployment manifests. The current open-source core starts smaller: contract validation, policy simulation, TypeScript and Python policy artifacts, generated tests, and runnable examples.

## What Axiom Is Best Compared To

Axiom is closest to a combination of:

- TypeScript interfaces
- Rust-style safety thinking
- Rego-style policy
- workflow engines
- infrastructure-as-code
- threat modeling
- state machines
- audit schemas
- capability security
- AI-agent operating rules

But none of those alone makes agent authority, sensitive data disclosure, approval, brokered execution, and auditability the primary programming model.

That is Axiom's intended gap.

## High-Level Comparison

| System | Primary Unit | Main Strength | Main Blind Spot | What Axiom Adds |
|---|---|---|---|---|
| Python | Function / module | Fast development, readability, ecosystem | Ambient authority, weak security boundaries by default, runtime errors | Capability contracts, policy gates, sensitive data classes, brokered effects |
| JavaScript | Function / event | Browser-native interactivity, huge ecosystem | Chaotic runtime surface, weak typing unless layered, supply-chain risk | Declared authority, effect constraints, generated UI contracts |
| TypeScript | Typed module / component | Better structure for web apps, strong editor tooling | Types do not express trust, approval, disclosure, or broker boundaries | Semantic types for sensitivity, capability, destination, and effects |
| Rust | Ownership / memory safety | Strong memory safety, performance, correctness | Does not natively model human approval, agent misuse, or data disclosure policy | Agent authority model, policy graph, audit and approval semantics |
| Go | Service / package | Simple backend services, concurrency, deployment ease | Limited expressive safety model, manual policy and audit structure | Explicit capability surfaces and generated security tests |
| SQL | Table / query | Data persistence and relational integrity | Query access can easily become broad retrieval | Data-class-aware disclosure constraints and broker-only access |
| GraphQL | Schema / resolver | Flexible client data fetching | Can encourage broad graph traversal and over-disclosure | Capability-first APIs instead of arbitrary data graph access |
| Rego / OPA | Policy rule | Deterministic policy evaluation | Policy is separate from product intent, UI, broker behavior, and audit | End-to-end capability contract across API, broker, UI, tests, and deploy |
| Terraform | Infrastructure resource | Repeatable infrastructure provisioning | Does not define application authority or data disclosure behavior | App-level trust boundaries, effects, and runtime policy |
| Kubernetes | Workload / service | Orchestration, isolation, scaling | Infrastructure control, not semantic app safety | Semantic service authority and capability isolation |
| Temporal / workflow engines | Durable workflow | Reliable long-running processes | Workflow does not inherently know data sensitivity or approval meaning | Sensitive-effect gates, approval binding, audit obligations |
| React | Component | UI composition | UI can hide or misrepresent security-critical context | Approval and disclosure UI contracts generated from capability specs |
| State machines | State transition | Predictable interaction flow | Usually local behavior only, not full trust model | Actor, data, policy, effect, and audit semantics |
| OpenAPI | Endpoint schema | API documentation and validation | Describes routes, not whether routes should exist | Rejects generic retrieval routes that violate product invariants |

## Matrix By Capability

| Capability | Python | TypeScript | Rust | Rego / OPA | Workflow Engine | Axiom |
|---|---:|---:|---:|---:|---:|---:|
| Express product intent as executable structure | Low | Low | Low | Low | Medium | High |
| Model actors as trusted/untrusted entities | Manual | Manual | Manual | Medium | Manual | Native |
| Define sensitive data classes | Manual | Medium with types | Medium with types | Medium | Manual | Native |
| Prevent broad retrieval by design | Manual | Manual | Manual | Policy-only | Manual | Native |
| Require brokered disclosure | Manual | Manual | Manual | Partial | Manual | Native |
| Distinguish masked, summary, tokenized, and task-field outputs | Manual | Medium | Medium | Medium | Manual | Native |
| Bind approval to request hash, actor, destination, and expiry | Manual | Manual | Manual | Partial | Medium | Native |
| Generate approval UI requirements | None | Manual | None | None | None | Native |
| Generate audit event obligations | Manual | Manual | Manual | Partial | Medium | Native |
| Detect generic secret export routes | External tooling | External tooling | External tooling | Partial | None | Native |
| Treat model output as non-authoritative for access decisions | Policy discipline | Policy discipline | Policy discipline | Medium | Manual | Native rule |
| Compile to deployable app artifacts | No | No | No | No | No | Intended |
| Generate policy matrix tests from capability specs | No | No | No | Partial | No | Intended |

## Pros

| Pro | Why It Matters |
|---|---|
| Capability-first design | Agents request narrow operations instead of broad data access. |
| Deterministic policy outside the model | LLMs cannot become the final authority for sensitive access. |
| Sensitive data classes are first-class | Identity, tax, payment, medical, and operational data can carry different rules. |
| Brokered execution is native | Raw secrets can be used without being returned to agents. |
| Approval is specific and auditable | Approval is not a vague boolean or broad trust toggle. |
| Anti-drift guardrails | Build checks can reject convenience endpoints that violate the architecture. |
| Generated tests from contracts | The capability spec can produce allow / deny / require_approval test matrices. |
| Better future-agent handoff | Another agent can inspect the Axiom graph and understand the system's promises. |
| Security context reaches the UI | Approval screens can be generated from policy context, not improvised. |
| Runtime can be thin | Heavy reasoning happens at design/build time; production enforcement can be compiled and fast. |

## Cons

| Con | Why It Matters | Mitigation |
|---|---|---|
| Higher upfront complexity | Axiom requires a compiler, schema model, policy model, and verification process. | Start with Axiom Lite: structured specs plus test generation. |
| Developers may resist constraints | It blocks shortcuts that make demos faster. | Keep escape hatches, but require declared contracts. |
| Generated-code debugging can be painful | Bugs may appear in emitted framework code. | Strong source maps, readable generated code, manual implementation zones. |
| Not needed for simple apps | A toy calculator or static site does not need this much machinery. | Use Axiom only for agentic, sensitive, or high-trust workflows. |
| False confidence risk | A formal-looking graph can make people overtrust the system. | Keep threat model explicit and require normal security reviews. |
| Policy design can become organizational politics | The language surfaces who is allowed to do what. | Treat policy choices as product/security decisions, not just engineering details. |
| Runtime overhead if done poorly | Provenance and policy checks can bloat frontend and server work. | Compile aggressively; keep frontend runtime thin. |
| Hard to standardize early | The model may evolve while building the first real product. | Let real agent-facing use cases drive the first useful subset. |

## What Axiom Provides That Existing Languages Do Not

### 1. Authority As Source Code

Most languages let code do whatever the process can do.

Axiom makes authority explicit:

```text
actor ExternalAgent
  trust authenticated_but_untrusted
  may request capability
  may_not retrieve raw records
```

### 2. Disclosure Modes As Types

Existing languages can type a string or object. They usually do not type what kind of disclosure is allowed.

Axiom does:

```text
disclosure:
  mode masked_value | task_fields | tokenized_reference
  forbidden raw_profile_export
```

### 3. Brokered Action Instead Of Raw Retrieval

Existing APIs tend to expose data.

Axiom prefers operations:

```text
capability fill_tax_identity_fields
  broker:
    may_decrypt tax.identity
    may_return task_fields
    forbidden raw_tax_payload
```

### 4. Approval As A Cryptographically Meaningful Object

Approval is not:

```text
approved: true
```

It is:

```text
approval:
  one_time_default
  binds request_hash, account_id, agent_id, capability_key, destination_identity, expiry
```

### 5. UI Honesty As A Build Constraint

Axiom can require approval UI to show security-critical information:

```text
surface ApprovalRequestCard
  displays:
    agent_name
    capability_name
    destination_identity
    destination_trust
    data_classes
    disclosure_mode
    expiry
```

If the UI hides destination trust, the build should fail.

### 6. Anti-Convenience Drift

Axiom can reject code paths that violate product invariants:

```text
invariant capability_not_retrieval
  forbid:
    agent_route returns raw_sensitive_record
    agent_route lists all_records
    agent_route searches decrypted_payload
```

## Where Axiom Should Not Compete

Axiom should not try to be:

- faster than Rust
- easier for scripts than Python
- better for UI composition than React
- better for relational queries than SQL
- better for infrastructure resources than Terraform

That would be the wrong fight.

Axiom should make those systems safer to generate, connect, constrain, and deploy when AI agents and sensitive actions are involved.

## Best Initial Use Cases

Axiom is most useful where these are true:

- AI agents call into the system
- private or sensitive data is involved
- external actions are possible
- approval matters
- auditability matters
- model reasoning must not be trusted as policy
- broad retrieval would be dangerous

Examples:

- agent payment broker
- AI-driven form filling
- medical intake helper
- business identity workflow
- tax document preparation assistant
- permissioned agent marketplace
- enterprise agent action gateway

## Poor Initial Use Cases

Axiom is probably overkill for:

- static marketing pages
- simple dashboards with public data
- small internal scripts
- toy apps
- basic CRUD with non-sensitive data
- performance-critical low-level systems

## Practical Verdict

Axiom should be built as a layer, not a replacement.

The practical stack for an Axiom-governed application can remain:

```text
FastAPI
Pydantic
SQLAlchemy
Next.js
TypeScript
pytest
Docker
```

Axiom should sit above that stack. The current core starts with capability specs, policy simulation, generated artifacts, and generated tests; future targets can add:

```text
Axiom capability specs
  -> generated schemas
  -> policy matrix tests
  -> broker contracts
  -> approval UI requirements
  -> audit obligations
  -> route guardrails
```

The first useful version does not need to be a full language.

It needs to stop agent-facing systems from becoming broader and less accountable than their original design.
