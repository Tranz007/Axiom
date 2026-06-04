# Security Policy

Axiom is an experimental prototype and should not be treated as a production security boundary yet.

## Supported Versions

Only the current `main` branch is supported during the prototype phase. No stable release line exists yet.

## Reporting Security Issues

Please do not open public issues for sensitive security reports.

Until a dedicated security contact is published, report sensitive issues privately to the repository owner through GitHub. Public issues are appropriate for ordinary bugs, documentation problems, and feature requests that do not expose a vulnerability.

## Current Security Posture

The MVP CLI can detect some unsafe capability contract patterns, including:

- high-sensitivity data access without approval paths
- high-sensitivity data access without broker boundaries
- policy language that delegates decisions to a model
- audit obligations that fail to forbid raw or plaintext sensitive values

It does not yet provide:

- formal verification
- sandboxing
- production runtime enforcement
- complete parser coverage
- vulnerability protection for generated applications

Treat generated artifacts as scaffolding that still requires ordinary security review.

## What Counts As Security-Sensitive

Examples include:

- a generated evaluator allowing a denied path
- approval-required paths being treated as allow
- raw or plaintext sensitive data appearing in generated audit artifacts
- a validation bypass for model-decided policy
- package, CLI, or template behavior that creates broader authority than the `.ax` contract declares

## What Is Not A Security Boundary Yet

Axiom does not currently sandbox agents, isolate processes, enforce runtime permissions, or prove generated applications secure. It is a contract and artifact tool that can help catch authority drift, but application teams still need normal security engineering, review, testing, and deployment controls.
