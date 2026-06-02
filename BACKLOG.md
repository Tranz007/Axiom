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

## Now

### Package For Local Install

Goal:

- make the repo feel publishable without necessarily publishing yet

Tasks:

- review package name
- decide whether `private` should stay true
- add npm package files allowlist
- test `npm pack`
- document local install flow

Possible package names:

- `@axiom-lang/axiom`
- `@axiom-lang/cli`

## Later

### Python Target

Generate:

- Pydantic models
- policy evaluator
- audit contract stubs

### Policy Diff

Expected shape:

```bash
axiom diff old.ax new.ax
```

Should show:

- added capabilities
- removed capabilities
- changed data access
- changed disclosure modes
- changed approval requirements

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
