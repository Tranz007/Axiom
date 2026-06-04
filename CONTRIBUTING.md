# Contributing To Axiom

Axiom is experimental. The best contributions right now are small, testable changes that make the language more useful to developers and AI coding agents.

Before proposing a large new language feature, look for a narrow way to prove it through validation, generation, simulation, or an example.

## Start Here

```bash
node ./bin/axiom.mjs init --guided --out /tmp/axiom-starter
node ./bin/axiom.mjs next --cwd /tmp/axiom-starter
node ./bin/axiom.mjs simulate-examples --cwd /tmp/axiom-starter
node --test
```

## Local Checks

```bash
node ./bin/axiom.mjs validate examples/agent-capability-gateway/axiom.ax
node ./bin/axiom.mjs validate examples/receipt-archive/axiom.ax
node ./bin/axiom.mjs validate examples/local-private-notes/axiom.ax
node ./bin/axiom.mjs validate examples/local-private-notes-python/axiom.ax
node examples/local-private-notes/app/policy-demo.mjs
python3 examples/local-private-notes-python/app/policy_demo.py
node --test
```

## Contribution Priorities

- Pick from [BACKLOG.md](BACKLOG.md) when possible.
- Improve validation diagnostics.
- Add bad fixtures for unsafe agent-facing patterns.
- Add generated artifacts that developers can actually use.
- Keep syntax changes reflected in `spec/grammar.md`.
- Avoid broad rewrites until the MVP behavior is stable.

## Adding Examples

Good examples are small and runnable. They should show ordinary app code importing generated Axiom artifacts, not a large framework scaffold.

An example should usually include:

- an `.ax` contract
- generated artifacts when they help readers inspect the output
- a short README
- a tiny demo or test that exercises allow, deny, and require_approval paths when possible

## Adding Validation Rules

Validation rules should fail unsafe or ambiguous capability contracts with plain-language diagnostics. If a rule is easy to misunderstand, add a bad fixture under `tests/fixtures/bad` and assert the diagnostic text in `tests/cli.test.mjs`.

## Adding Generator Targets

Generator targets should produce readable artifacts that an app can import. Do not add a framework generator until the contract shape is already proven with small examples.

## Design Bar

Axiom should earn complexity by catching or preventing authority drift. If a change only makes the syntax prettier, it probably belongs in documentation until it can produce validation, generation, or runtime value.
