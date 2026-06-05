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

## Phase 1.5: Agent Instruction Onboarding

Goal:

Make Axiom usable by people who build with AI coding agents before they understand the full language.

Scope:

- add static instruction templates for Codex `AGENTS.md`, Claude `CLAUDE.md`, Cursor rules, and generic agent instructions
- add `axiom init --agent codex` to generate a starter `app.ax` plus agent instructions
- add app-type starters such as local private app, agent gateway, sensitive upload app, and approval-gated automation
- add guided questions that help an agent identify sensitive data, actors, capabilities, effects, approvals, and audit obligations
- add a project health check such as `axiom doctor`
- add an agent-facing next-action command such as `axiom next`
- add a simple way to run starter policy simulations before generation

Non-goals:

- making Axiom a replacement for engineering judgment
- promising that non-developers can safely ship high-risk regulated production systems without review
- adding full framework code generation before the contract onboarding flow works

Success:

- a user can ask an AI coding agent to build an app and have the agent create `app.ax` before implementation code
- generated instructions tell the agent not to add routes, tools, or jobs that bypass the Axiom contract
- first-run validation errors explain authority problems in plain language
- consumer/developer onboarding does not require starting from a blank `.ax` file

Current status:

- static agent instruction templates exist
- starter app templates exist
- `axiom init` can generate `app.ax`, agent instructions, and simulation hints
- `axiom try` can run the first local walkthrough in one command
- `axiom define` can create a plain-language contract outline for initial setup or later updates
- `axiom doctor` can explain whether a project has the first Axiom files in place
- `axiom next` can recommend the next useful action for a human or coding agent
- `axiom simulate-examples` can run starter policy scenarios and save results
- `axiom init --guided` can select a starter template and agent instruction target
- `axiom generate --target python` can emit Pydantic contract models, a deterministic policy evaluator, audit stubs, and reports
- `axiom verify` can compare generated artifacts against `app.ax`, emit graph and artifact hashes, and write local verification evidence

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

Current status:

- TypeScript generation emits broker contracts and audit payload guards.
- The generated customer-support app skeleton tests reject forbidden broker and audit fields.

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

Current status:

- TypeScript generation emits approval payload contracts and validates required binding fields.
- The generated app skeleton returns `approval_required` before approval-bound paths execute.

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

Current status:

- TypeScript generation emits a minimal Node app skeleton and generated skeleton tests.
- This is not yet full app generation; auth, persistence, transport, and UI remain manual.

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
