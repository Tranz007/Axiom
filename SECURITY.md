# Security Policy

Axiom is an experimental prototype and should not be treated as a production security boundary yet.

## Supported Version

Only the current `main` branch is supported during the prototype phase.

## Reporting Security Issues

Please do not open public issues for sensitive security reports. Contact the repository owner privately first.

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
