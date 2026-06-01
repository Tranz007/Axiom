# Contributing To Axiom

Axiom is experimental. The best contributions right now are small, testable changes that make the language more useful to developers.

## Local Checks

```bash
node ./bin/axiom.mjs validate examples/agent-capability-gateway/axiom.ax
node ./bin/axiom.mjs validate examples/receipt-archive/axiom.ax
node --test
```

## Contribution Priorities

- Improve validation diagnostics.
- Add bad fixtures for unsafe agent-facing patterns.
- Add generated artifacts that developers can actually use.
- Keep syntax changes reflected in `spec/grammar.md`.
- Avoid broad rewrites until the MVP behavior is stable.

## Design Bar

Axiom should earn complexity by catching or preventing authority drift. If a change only makes the syntax prettier, it probably belongs in documentation until it can produce validation, generation, or runtime value.
