# Axiom Roadmap

This roadmap assumes Axiom begins as a small practical toolchain, not a full language implementation.

The implementation should be pragmatic. Axiom should begin as a contract language plus generators and checks, not as a grand compiler project that delays real adoption.

## Phase 0: Documentation And Examples

Goal:

- define the language concept
- document the runtime model
- define the security model
- create examples
- define when Axiom is worth its complexity

Output:

- this documentation set
- example `.ax` files

## Phase 1: Axiom Lite

Goal:

Model agent-facing capabilities in a structured source format and generate tests.

Scope:

- define a simple parser or use a typed intermediate format
- model a small generic capability set
- model data classes
- model disclosure modes
- model policy outcomes
- generate pytest policy matrix cases
- generate schema stubs or compare against existing schemas

Non-goals:

- full code generation
- formal proof system
- production deployment bundle

Success:

- changing a capability definition updates tests
- generic retrieval routes are detected
- policy matrix clearly covers allow / deny / require_approval

## Phase 2: Broker And Audit Contracts

Goal:

Make broker behavior and audit coverage verifiable.

Scope:

- define broker contracts for each capability
- assert allowed data classes
- assert allowed response types
- define required audit events
- add tests that raw decrypted values do not appear in logs
- add tests for approval-required and denied paths

Success:

- broker cannot return response types outside the contract
- audit event coverage is testable
- raw secret logging is caught in tests

## Phase 3: Approval UX Contracts

Goal:

Ensure the approval UI is security-relevant, not decorative.

Scope:

- define required approval context fields
- generate TypeScript types for approval payloads
- generate UI tests ensuring required fields render
- validate one-time approval binding
- test expiry, replay, destination swap, and agent substitution

Success:

- approval screens cannot omit agent, capability, destination, data classes, disclosure mode, or expiry
- replay and mutation tests pass

## Phase 4: Code Generation

Goal:

Generate boring scaffolding from Axiom.

Scope:

- Pydantic request/response schemas
- TypeScript types
- route skeletons
- policy function stubs
- audit event schemas
- documentation tables

Success:

- generated code reduces drift
- manual implementation remains possible through declared escape hatches

## Phase 5: Deployment And Bundle Verification

Goal:

Make Axiom part of CI and deployment.

Scope:

- `axiom verify`
- generated verification report
- CI integration
- deployment manifest checks
- code hash tracking
- policy manifest

Success:

- builds fail on capability violations
- deployments include policy and verification artifacts

## Phase 6: Richer Agent Collaboration

Goal:

Let future agents inspect and modify Axiom-governed systems through the capability graph rather than ad hoc repo editing.

Scope:

- graph diffing
- capability proposal workflow
- security reviewer agent annotations
- policy conflict detection
- generated migration plans

Success:

- an agent proposing a new capability must define data classes, disclosure, policy, approval, broker, audit, and misuse path before code is generated

## Strong Warning

Do not let Axiom become a reason to delay useful software indefinitely.

The first useful implementation should be small:

```text
structured capability specs
policy matrix generator
route/retrieval guard
broker contract tests
audit coverage tests
```

That is enough to add real safety.
