# Axiom

**Status:** Concept specification  
**Purpose:** AI-native language and runtime model for building capability-bound, policy-verifiable applications.  

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

## Why This Complexity Exists

Human developers should be skeptical of new layers.

Axiom should not be used just because it is conceptually interesting. It is useful only when the system already has cross-cutting authority complexity: agents, sensitive data, approvals, external effects, audit obligations, and policy decisions that must not depend on model judgment.

The point is not to add ceremony. The point is to move security-critical promises out of scattered code, comments, and tribal memory into executable structure.

See [docs/why-axiom.md](docs/why-axiom.md).

## Initial Documentation Map

- [index.html](index.html): initial landing page
- [docs/language-overview.md](docs/language-overview.md): core concepts and syntax
- [docs/runtime-model.md](docs/runtime-model.md): build-time, runtime, frontend, backend, deployment
- [docs/security-model.md](docs/security-model.md): security posture, threats, capability isolation
- [docs/compiler-and-targets.md](docs/compiler-and-targets.md): how Axiom compiles to real software
- [docs/why-axiom.md](docs/why-axiom.md): developer-facing rationale for the added layer
- [docs/comparison-matrix.html](docs/comparison-matrix.html): human-readable visual comparison matrix
- [docs/comparison-matrix.md](docs/comparison-matrix.md): plain Markdown source for the comparison matrix
- [docs/roadmap.md](docs/roadmap.md): phased implementation plan
- [examples/receipt-archive.ax](examples/receipt-archive.ax): small app example
- [examples/agent-capabilities.ax](examples/agent-capabilities.ax): generic agent capability gateway example
