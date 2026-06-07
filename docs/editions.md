# Axiom Editions

Axiom can serve different audiences without becoming three different languages.

The right model is one shared Axiom core with separate paths for Axiom OS, enterprise teams, and government environments. Each path should have its own defaults, packaging, documentation, and trust posture, but the language primitives should stay compatible.

```text
Axiom Core
  language spec
  parser
  validator
  policy simulator
  deterministic runtime
  generated contracts
  approval model
  audit model
  bundle format
```

The editions should differ by audience and assurance requirements, not by fragmenting the foundation.

## Axiom OS

Axiom OS is the local open-source consumer and developer edition.

Its job is to prove the language, earn trust, and give developers a useful local tool for generating enforceable guardrails around AI-assisted software.

It should include:

- the `.ax` language specification
- local CLI
- parser and validator
- policy matrix generation
- policy simulation
- generated TypeScript and Python contracts
- local runtime guards
- examples
- security model documentation
- community-friendly contribution path

Axiom OS should be usable without a hosted service, account, or vendor lock-in.

The posture is transparent and educational:

```text
write .ax
validate contracts
simulate policy
generate artifacts
inspect everything locally
```

The planned public promise:

> Open-source capability contracts that generate guardrails for AI-assisted software.

## Axiom Enterprise

Axiom Enterprise is the future enterprise governance direction.

Its job would be to help companies use AI coding agents around business systems without giving those agents broad, unchecked authority.

It should add:

- organization policy profiles
- SSO and RBAC
- approval workflow integrations
- audit dashboards
- policy diffing
- CI/CD checks
- evidence reports
- data classification mapping
- model and tool governance reports
- connectors for enterprise systems
- SaaS, private cloud, and on-prem deployment options

The posture is operational and integration-friendly:

```text
agent request
  -> capability contract
  -> deterministic policy
  -> approval if needed
  -> broker execution
  -> shaped response
  -> semantic audit
```

The main promise:

> Govern AI agents across business systems with capability policy, approvals, and audit.

## Axiom Government

Axiom Government is the high-assurance public-sector and regulated-environment edition.

Its job is to support agencies, contractors, and regulated teams that need AI capability governance inside restricted cloud or on-prem environments.

It should add:

- GovCloud and restricted-environment deployment support
- default-deny policy profiles
- signed and offline-verifiable bundles
- air-gapped or limited-network operating modes
- evidence packs for review
- policy attestations
- separation-of-duty workflows
- high-assurance audit trails
- exportable control mappings
- stricter approval, revocation, and retention defaults

The posture is conservative, deterministic, and reviewable:

```text
verify before deploy
enforce inside the boundary
attest every release
export evidence
fail closed
```

The main promise:

> AI agent capability governance for high-trust government environments.

## Shared Foundation

All editions should share the same core concepts:

- intent
- actors
- data classes
- capabilities
- deterministic policy
- brokers
- effects
- approvals
- invariants
- audit events
- generated artifacts
- runtime enforcement

This matters because Axiom should not become a family of incompatible products.

A capability written for Axiom OS should be understandable by Axiom Enterprise and Axiom Government, even if those editions require stricter policy, approval, audit, or deployment evidence.

## What Changes By Edition

The editions should vary by defaults and integrations:

| Area | Axiom OS | Axiom Enterprise | Axiom Government |
| --- | --- | --- | --- |
| Primary user | developers and builders | platform, security, compliance, product teams | agencies, contractors, regulated teams |
| Deployment | local, open-source-oriented | SaaS, private cloud, on-prem | GovCloud, on-prem, restricted networks |
| Policy posture | explicit but flexible | organization-defined | default-deny and evidence-heavy |
| Approvals | local examples and generated contracts | workflow integrations and dashboards | separation of duties and attestations |
| Audit | generated schemas and local logs | searchable operational audit | high-assurance audit trails and exports |
| Evidence | verification report | compliance and governance reports | review packs and signed attestations |
| Support model | community | commercial | high-assurance commercial |

## Product Boundary

Axiom should not claim to make LLMs safe by itself.

The stronger claim is narrower:

> Axiom constrains the agency around models by making authority, data access, effects, approvals, and audit explicit and enforceable.

That is especially relevant for organizations that need to use LLMs but cannot allow models or generated code to silently widen authority.

The model provider may be OpenAI, Anthropic, an internal model, an AWS GovCloud-hosted model, or another approved provider. Axiom should sit around that model as the contract and enforcement layer.

## Development Order

The likely build order is:

1. Strengthen Axiom OS.
2. Add evidence-oriented outputs.
3. Add policy diffing and bundle verification.
4. Build business-oriented governance workflows.
5. Add government deployment and attestation profiles.

This keeps the future open-source core honest. If the local CLI cannot prove useful contracts, the enterprise and government versions would just be packaging around an unproven idea.

Axiom OS should become the foundation, not a demo.
