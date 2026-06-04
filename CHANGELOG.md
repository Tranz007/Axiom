# Changelog

All notable changes to Axiom will be documented here.

The project is experimental and pre-release.

## 0.1.0 - Unreleased

### Added

- MVP `.ax` parser and validator.
- CLI commands:
  - `axiom validate`
  - `axiom explain`
  - `axiom matrix`
  - `axiom simulate`
  - `axiom generate`
  - `axiom init`
  - `axiom doctor`
  - `axiom next`
  - `axiom simulate-examples`
  - `axiom generate-tests`
  - `axiom diff`
- Guided `axiom init --guided` setup for selecting a starter app and agent instruction target.
- TypeScript artifact generation:
  - `policy-matrix.json`
  - `capabilities.ts`
  - `data-classes.ts`
  - `audit-events.ts`
  - `policy-evaluator.ts`
  - `runtime-guards.ts`
  - `axiom-report.md`
- Starter app templates:
  - `local-private-app`
  - `agent-gateway`
  - `sensitive-upload-app`
  - `approval-gated-automation`
- Agent instruction templates:
  - Codex `AGENTS.md`
  - Claude `CLAUDE.md`
  - Cursor rules
  - generic `instructions.md`
- Public Axiom landing page.
- Public Axiom OS page.
- Public workflow diagrams for the README, landing page, and Axiom OS page.
- Developer rationale and comparison docs.
- Bad fixtures for unsafe patterns such as raw sensitive export, missing approval paths, model-decided policy, and unsafe audit logging.
- Generated Node policy tests from `axiom/simulations.json`.
- Tiny local private notes example app that imports a generated Node policy evaluator.
- Contract diffing for added, removed, and changed capabilities and data classes.
- Token-budget guidance for agent templates and external-model usage.
- First agent loop documentation and smoke coverage for the Axiom OS golden path.
- Python generation target for Pydantic contract models, policy evaluation, audit stubs, and reports.
- Tiny Python example that imports the generated policy evaluator from ordinary app code.
- Open-source readiness review with current blockers and non-blockers.
- Open-source contribution, security, issue template, pull request, conduct, and release checklist docs.
- Trademark and brand-use guidance for Axiom project names.

### Changed

- Public copy now leads with builder-friendly language before developer/security terms.
- Starter templates validate with zero errors and zero warnings.
- `axiom next` now recommends policy simulation before generation.
- `axiom next` now recommends generated policy tests, compact policy test runs, and stale artifact regeneration when applicable.
- Validation errors for sensitive-data risks now include plain-language guidance and concrete next steps.
- Generated artifacts now include `policy-evaluator.mjs` for plain Node examples.
- README and comparison copy now separate the current open-source core from the future compiler vision.
- Open-source readiness wording now reads as public release status.

### Fixed

- Corrected invariant validation so a program with multiple invariants does not warn when one invariant already forbids model-decided policy.
