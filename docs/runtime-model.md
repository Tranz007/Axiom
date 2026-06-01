# Axiom Runtime Model

Axiom should not run as a giant interpreter inside every app interaction.

The runtime is split into three layers:

1. design-time Axiom
2. build-time Axiom
3. runtime Axiom

Each layer has a different performance and security job.

## 1. Design-Time Axiom

Design-time Axiom is used while a human and agent shape the application.

It captures:

- product intent
- actors and trust boundaries
- data classes and sensitivity
- capability surfaces
- destination models
- approval posture
- threat assumptions
- non-negotiable invariants

This is where agent reasoning is most useful.

The agent can propose a capability, but the Axiom graph forces the proposal to answer:

- what exact workflow does this enable?
- what data classes does it need?
- can it be brokered without raw disclosure?
- what is the worst misuse path?
- does this require approval?
- what must be audited?
- what is intentionally forbidden?

## 2. Build-Time Axiom

Build-time Axiom is heavy.

It compiles and verifies the design graph.

Tasks include:

- generate framework code
- generate schemas
- generate policy tables or policy bytecode
- generate broker contracts
- generate approval UI requirements
- generate audit event schemas
- generate tests
- simulate adversarial requests
- check for forbidden routes
- check dependency and environment boundaries
- prepare deployment manifests

This phase can be slower because it runs during local development and CI.

## 3. Runtime Axiom

Runtime Axiom must be small, fast, and boring.

It enforces:

- capability checks
- policy decisions
- approval token binding
- broker input and output boundaries
- effect gates
- semantic audit emission
- denial behavior

Runtime Axiom should not perform expensive proof search or broad simulation during normal requests.

It should compile down to fast checks:

```text
request -> schema validation -> capability lookup -> policy decision -> broker execution -> audit
```

## Frontend Runtime

The browser should receive only the minimum Axiom client runtime needed for safe interaction.

Frontend Axiom may:

- validate UI state transitions
- label sensitive actions
- render approval context
- gate irreversible client actions
- redact logs and telemetry
- hold narrow client capabilities

Frontend Axiom should not:

- run full policy evaluation for server-owned decisions
- carry broad secrets
- include the entire capability catalog when not needed
- perform heavyweight proofs on every click

Example frontend use:

```text
surface ApprovalCard
  displays:
    agent_name
    capability_name
    destination_trust
    data_classes
    disclosure_mode
    expiry

  actions:
    approve -> signed_one_time_decision
    deny -> signed_denial

  forbidden:
    approve_without_request_hash
    hide_destination
    hide_raw_exposure_status
```

This compiles to React components plus state-machine and validation helpers.

## Backend Runtime

The backend carries most enforcement.

Backend Axiom should wrap or generate:

- route schemas
- agent auth validation
- policy engine calls
- approval validation
- broker dispatch
- response shaping
- audit emission

Example request flow:

```text
Agent -> POST /capabilities/use_approved_address
  1. authenticate agent
  2. validate request schema
  3. normalize destination
  4. evaluate deterministic policy
  5. write decision audit event
  6. if allow, execute broker
  7. shape response to allowed disclosure mode
  8. write execution audit event
```

## Deployment Runtime

Axiom deployment artifacts should include:

- generated code
- policy manifest
- capability manifest
- migration plan
- environment variable requirements
- service identity map
- audit schema version
- rollback plan
- proof or verification report

A deployable bundle should be signed:

```text
VaultMVP.axbundle
  app_graph
  generated_code_hashes
  policy_manifest
  migration_manifest
  runtime_requirements
  verification_report
  signature
```

Production should reject unsigned or unverified bundles.

## Performance Posture

Axiom performance should follow this rule:

```text
heavy before deploy
thin during ordinary UI
strict around sensitive effects
```

Most checks should be compiled away or reduced to simple lookup and validation at runtime.

Axiom should not be used to justify slow applications.

