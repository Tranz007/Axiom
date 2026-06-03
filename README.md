# Axiom

**Status:** Experimental CLI prototype and concept specification  
**Purpose:** AI-native language and runtime model for building capability-bound, policy-verifiable applications.  

Axiom is an experimental language concept for building software with AI agents without treating generated application code as the real source of truth.

The repo now includes a first usable MVP: a dependency-light Node CLI that parses `.ax` files, validates capability contracts, reports authority and disclosure problems, and generates initial TypeScript policy artifacts.

## Current Status

Axiom is currently in private development. The public site is a development preview, and the open-source release is planned after the CLI, examples, packaging, and docs are hardened.

The package is intentionally still marked `"private": true`. Packaging work in this repo is for dry runs and local install testing, not npm publication yet.

## Start Here

Prerequisite: Node.js 20 or newer.

The open-source flow is designed for a human who installs Axiom and an AI coding agent that uses it inside a project.

For a guided template picker:

```bash
node ./bin/axiom.mjs init --guided --out /tmp/axiom-starter
```

For the direct path:

```bash
git clone https://github.com/Tranz007/Axiom.git
cd Axiom
node ./bin/axiom.mjs init --template local-private-app --agent codex --out /tmp/axiom-starter
node ./bin/axiom.mjs doctor --cwd /tmp/axiom-starter
node ./bin/axiom.mjs next --cwd /tmp/axiom-starter
node ./bin/axiom.mjs simulate-examples --cwd /tmp/axiom-starter
node ./bin/axiom.mjs next --cwd /tmp/axiom-starter
node ./bin/axiom.mjs generate /tmp/axiom-starter/app.ax --target typescript --out /tmp/axiom-starter/generated
node ./bin/axiom.mjs generate-tests /tmp/axiom-starter/app.ax --examples /tmp/axiom-starter/axiom/simulations.json --out /tmp/axiom-starter/generated-tests
node --test /tmp/axiom-starter/generated-tests/axiom-policy.test.mjs
```

That creates:

- `app.ax`: the app contract
- `AGENTS.md`: instructions for the coding agent
- `axiom/simulations.json`: starter policy scenarios
- `axiom/simulation-results.json`: saved simulation output after `simulate-examples`
- `generated/`: TypeScript policy and contract artifacts after `generate`
- `generated-tests/`: runnable Node policy tests after `generate-tests`

To inspect the bundled examples:

```bash
node ./bin/axiom.mjs validate examples/agent-capability-gateway/axiom.ax
node ./bin/axiom.mjs matrix examples/agent-capability-gateway/axiom.ax
node ./bin/axiom.mjs diff examples/local-private-notes/axiom.ax templates/apps/local-private-app.ax
node ./bin/axiom.mjs simulate examples/agent-capability-gateway/axiom.ax --capability fill_tax_identity_fields --fact standing_policy_absent=true
node ./bin/axiom.mjs generate examples/agent-capability-gateway/axiom.ax --target typescript --out examples/agent-capability-gateway/generated
node examples/local-private-notes/app/policy-demo.mjs
node --test
```

If `npm` is available, these shortcuts also work:

```bash
npm run validate:examples
npm run generate:example
npm run demo:local-private-notes
npm test
```

For local tool testing from a private checkout:

```bash
npm link
axiom init --guided --out /tmp/axiom-linked-starter
axiom doctor --cwd /tmp/axiom-linked-starter
```

To inspect what would be included in a package without publishing:

```bash
npm pack --dry-run
```

## What Works Today

The current CLI can:

- initialize starter `app.ax` projects with AI coding agent instructions
- guide first-time setup with `axiom init --guided`
- inspect project readiness with `axiom doctor`
- recommend the next useful agent action with `axiom next`
- run starter policy simulations with `axiom simulate-examples`
- generate runnable policy tests from starter simulations with `axiom generate-tests`
- parse the MVP indentation-based `.ax` format
- validate that capabilities declare purpose, policy, disclosure, broker, approval, and audit obligations where required
- explain common sensitive-data validation failures with concrete next steps
- fail unsafe examples such as raw sensitive export, missing approval paths, model-decided policy, and unsafe audit logging
- print a policy matrix as JSON
- diff two `.ax` contracts for capability and data-class changes
- simulate deterministic policy decisions from boolean request facts
- generate TypeScript artifacts for capabilities, data classes, audit obligations, runtime guards, and verification reports

The current CLI cannot yet:

- generate a full application
- replace framework code
- execute policies against real request context
- parse rich expressions beyond simple boolean facts
- guarantee security by itself
- parse every future Axiom syntax idea in the docs

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

- [spec/grammar.md](spec/grammar.md): MVP grammar currently supported by the CLI
- [docs/language-overview.md](docs/language-overview.md): core concepts and syntax
- [docs/runtime-model.md](docs/runtime-model.md): build-time, runtime, frontend, backend, deployment
- [docs/security-model.md](docs/security-model.md): security posture, threats, capability isolation
- [docs/compiler-and-targets.md](docs/compiler-and-targets.md): how Axiom compiles to real software
- [docs/axiom-os.html](docs/axiom-os.html): public-facing open-source edition page
- [docs/editions.html](docs/editions.html): public-facing edition strategy page
- [docs/editions.md](docs/editions.md): Axiom OS, Axiom Business, and Axiom Government distribution strategy
- [docs/agent-instructions.md](docs/agent-instructions.md): instructions layer for AI coding agents and non-expert builders
- [docs/why-axiom.html](docs/why-axiom.html): developer-facing rationale for the added layer
- [docs/skills-vs-axiom.html](docs/skills-vs-axiom.html): how Axiom differs from Markdown agent skills and reusable AI guidance
- [docs/why-axiom.md](docs/why-axiom.md): plain Markdown source for the rationale
- [docs/comparison-matrix.html](docs/comparison-matrix.html): human-readable visual comparison matrix
- [docs/comparison-matrix.md](docs/comparison-matrix.md): plain Markdown source for the comparison matrix
- [docs/roadmap.md](docs/roadmap.md): phased implementation plan
- [BACKLOG.md](BACKLOG.md): tactical next work for open-source readiness
- [CHANGELOG.md](CHANGELOG.md): notable repo changes
- [examples/receipt-archive.ax](examples/receipt-archive.ax): small app example
- [examples/receipt-archive](examples/receipt-archive): runnable receipt archive example with generated artifacts
- [examples/local-private-notes](examples/local-private-notes): tiny runnable app example that imports a generated policy evaluator
- [examples/agent-capabilities.ax](examples/agent-capabilities.ax): generic agent capability gateway example
- [examples/agent-capability-gateway](examples/agent-capability-gateway): runnable agent gateway example with generated artifacts
- [tests/fixtures/bad](tests/fixtures/bad): intentionally unsafe examples that should fail validation
