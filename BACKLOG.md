# Axiom Backlog

This is the tactical backlog for making Axiom feel like a real open-source tool.

The roadmap explains phases. This file lists concrete next work that contributors and coding agents can pick up.

## Recently Built

- `axiom generate-tests` turns `axiom/simulations.json` into runnable Node policy tests.
- Starter simulation hints now carry expected decisions.
- `axiom simulate-examples` now fails when an expected decision does not match the policy result.
- Validation errors for sensitive-data risks now include plain-language guidance.
- `axiom init --guided` provides a small template and agent-instruction picker.
- `axiom try` provides a one-command local walkthrough for first-time users.
- `axiom define` creates a plain-language contract outline for initial setup and later updates.
- `examples/local-private-notes` shows app code importing a generated policy evaluator.
- `examples/customer-support-action` shows a business-facing support action with approval-gated refund behavior.
- Private package readiness is in place with a package allowlist, local install docs, and CI `npm pack --dry-run`.
- `axiom diff old.ax new.ax` reports added, removed, and changed capabilities and data classes.
- Agent templates now tell agents to keep external-model context small and use focused Axiom commands.
- `axiom next` now stays compact while recognizing generated tests and stale generated artifacts.
- `docs/first-agent-loop.md` documents the compact Axiom OS golden path and tests cover it.
- Public pages now include a short risks entry point and model-agnostic language for Codex, Claude, Cursor, Copilot, DeepSeek, Qwen, Mistral, internal models, and custom agents.
- `axiom generate --target python` creates Pydantic contract models, a policy evaluator, audit stubs, and reports.
- `examples/local-private-notes-python` shows Python app code importing a generated policy evaluator.
- Open-source hygiene now includes contribution guidance, security policy, issue templates, pull request template, code of conduct, and release checklist.
- `axiom verify` checks generated artifacts against `app.ax`, reports graph and artifact hashes, and writes verification evidence when requested.
- The TypeScript generator now emits broker contracts, approval contracts, audit guards, and a minimal app skeleton with generated Node guardrail tests.
- The TypeScript generator now emits framework-neutral route skeletons and generated route guardrail tests.
- The TypeScript generator now emits approval review models and manual integration contracts with generated guardrail tests.
- `examples/customer-support-action/app/support-mini-app.mjs` proves the first approval-backed route flow with broker and audit hooks.
- `axiom verify --write` now records generated test artifact coverage in the verification manifest and report.

## Now

### First Mini App Hardening

Harden the first approval-backed mini app slice:

- keep `examples/customer-support-action` as the representative proof target
- keep the generated approval and integration tests representative
- add one real framework adapter only after the plain Node flow stays stable
- prove auth failures, audit write failures, and approval persistence failures explicitly
- keep manual implementation escape hatches obvious
- do not claim full application generation until auth, persistence, transport, and UI contracts are production-shaped

## Later

### Stronger Verification Bundles

Extend `axiom verify` beyond local hash checks:

- signed manifests
- generated policy manifest export
- CI examples for GitHub Actions
- optional release bundle metadata

## Product Guardrails

- Keep first contact simple.
- Do not make Axiom look like a mature enterprise platform before the open-source core proves itself.
- Prefer commands that help agents know what to do next.
- Do not hide the serious model from developers.
- Do not lead public-facing copy with insider terms when plain language works.
