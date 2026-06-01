# Axiom

**Status:** Concept specification  
**Purpose:** AI-native language and runtime model for building capability-bound, policy-verifiable applications.  
**Primary near-term target:** Vault

Axiom is an experimental language concept for building software with AI agents without treating generated application code as the real source of truth.

Open the local landing page at [index.html](index.html).

In ordinary development, a human or agent writes framework code first: React components, API routes, database models, middleware, tests, deployment config. Security and intent are scattered across comments, docs, auth checks, policy files, test suites, and memory.

Axiom reverses that order.

The source of truth is an executable intent graph:

- what the system is for
- what actors may request
- what data classes exist
- what capabilities are allowed
- what effects are dangerous
- what policy decides
- when approval is required
- what the broker may disclose
- what must be audited
- what invariants must never be violated

Axiom then compiles that graph into ordinary software artifacts: TypeScript, Python, FastAPI routes, React UI, policy rules, tests, audit schemas, deployment manifests, and runtime guards.

The goal is not prettier syntax. The goal is safer agency.

## One-Sentence Definition

Axiom is an AI-native programming model where applications are authored as constrained worlds of intent, capability, data sensitivity, policy, brokered effects, approval gates, and audit obligations, then compiled into ordinary deployable software.

## The Core Bet

AI agents should not be trusted because they are authenticated, useful, convincing, or locally running in a developer tool.

They should be able to act only through narrow, declared, policy-checked capabilities.

Axiom makes this pattern native.

## What Axiom Is

Axiom is:

- a source-of-truth layer above normal application frameworks
- a capability definition language
- a policy and approval contract language
- a threat-model-aware compiler
- a runtime enforcement layer
- a semantic audit generator
- a way for agents to build software without silently expanding their own authority

## What Axiom Is Not

Axiom is not:

- JSON with nicer names
- YAML config for agents
- a replacement for browsers, servers, or databases
- a general-purpose scripting language
- a magical zero-day shield
- a reason to skip ordinary security engineering
- a way for models to decide policy
- a broad memory or secret retrieval interface
- a framework that should be used for every small website

## Why It Exists

Human-first programming languages were designed around instructions:

```text
do this
then this
call that
return this
```

Agent-built systems need a deeper contract:

```text
this is the purpose
this is the actor
this is the authority
this is the sensitive data involved
this is the destination
this is the allowed disclosure
this requires approval
this is forbidden
this must be audited
this must stop if the world changes
```

Axiom exists because software built by agents needs to preserve intent and authority as first-class executable structure.

## The Shape Of An Axiom Program

An Axiom application is made from:

- **Worlds:** bounded operating contexts
- **Actors:** users, agents, services, workers, admins
- **Data Classes:** typed sensitive or operational data
- **Capabilities:** narrow operations that actors can request
- **Policies:** deterministic allow / deny / require_approval decisions
- **Brokers:** trusted execution boundaries that may touch sensitive data
- **Effects:** external or irreversible actions
- **Approvals:** scoped human authorization gates
- **Invariants:** promises the system must keep
- **Audit Events:** durable semantic traces of sensitive operations
- **Targets:** generated code and deployment artifacts

See [docs/language-overview.md](docs/language-overview.md) for details.

## Why This Matters For Vault

Vault is already close to the Axiom thesis.

Vault is not supposed to be a generic store of secrets that agents can search. It is supposed to be a policy-enforced sensitive action layer where agents request capabilities, deterministic policy decides what can happen, a broker performs narrow work, and audit logs preserve accountability.

Axiom would let Vault define that architecture as executable source, not just documentation.

See [docs/vault-integration.md](docs/vault-integration.md).

## Initial Documentation Map

- [index.html](index.html): initial landing page
- [docs/language-overview.md](docs/language-overview.md): core concepts and syntax
- [docs/runtime-model.md](docs/runtime-model.md): build-time, runtime, frontend, backend, deployment
- [docs/security-model.md](docs/security-model.md): security posture, threats, capability isolation
- [docs/compiler-and-targets.md](docs/compiler-and-targets.md): how Axiom compiles to real software
- [docs/comparison-matrix.html](docs/comparison-matrix.html): human-readable visual comparison matrix
- [docs/comparison-matrix.md](docs/comparison-matrix.md): plain Markdown source for the comparison matrix
- [docs/vault-integration.md](docs/vault-integration.md): how Axiom applies to Vault
- [docs/roadmap.md](docs/roadmap.md): phased implementation plan
- [examples/receipt-vault.ax](examples/receipt-vault.ax): small app example
- [examples/vault-capabilities.ax](examples/vault-capabilities.ax): Vault capability examples
