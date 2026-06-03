# Axiom Backlog

This is the tactical backlog for making Axiom feel like a real open-source tool.

The roadmap explains phases. This file lists concrete next work that contributors and coding agents can pick up.

## Recently Built

- `axiom generate-tests` turns `axiom/simulations.json` into runnable Node policy tests.
- Starter simulation hints now carry expected decisions.
- `axiom simulate-examples` now fails when an expected decision does not match the policy result.
- Validation errors for sensitive-data risks now include plain-language guidance.
- `axiom init --guided` provides a small template and agent-instruction picker.
- `examples/local-private-notes` shows app code importing a generated policy evaluator.
- Private package readiness is in place with a package allowlist, local install docs, and CI `npm pack --dry-run`.
- `axiom diff old.ax new.ax` reports added, removed, and changed capabilities and data classes.
- Agent templates now tell agents to keep external-model context small and use focused Axiom commands.

## Now

### Python Target

Generate:

- Pydantic models
- policy evaluator
- audit contract stubs

## Later

### Bundle Verification

Expected shape:

```bash
axiom verify
```

Should eventually include:

- graph hash
- generated artifact hashes
- policy manifest
- verification report
- CI-friendly exit codes

## Product Guardrails

- Keep first contact simple.
- Do not make Axiom look like a mature enterprise platform before the open-source core proves itself.
- Prefer commands that help agents know what to do next.
- Do not hide the serious model from developers.
- Do not lead public-facing copy with insider terms when plain language works.
