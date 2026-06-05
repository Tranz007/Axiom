# Open Source Readiness

This page tracks the current release status for Axiom OS as an experimental open-source project.

Axiom is useful only if a developer or advanced AI-assisted builder can run the first loop, inspect the generated artifacts, understand the limits, and see enough proof that the contract model is real.

## Ready Now

- Fresh-project flow works:

```bash
node ./bin/axiom.mjs try --out /tmp/axiom-starter --force
```

- Explicit first-agent loop works:

```bash
node ./bin/axiom.mjs init --template local-private-app --agent codex --out /tmp/axiom-starter
node ./bin/axiom.mjs doctor --cwd /tmp/axiom-starter
node ./bin/axiom.mjs next --cwd /tmp/axiom-starter
node ./bin/axiom.mjs simulate-examples --cwd /tmp/axiom-starter
node ./bin/axiom.mjs next --cwd /tmp/axiom-starter
node ./bin/axiom.mjs generate /tmp/axiom-starter/app.ax --target typescript --out /tmp/axiom-starter/generated
node ./bin/axiom.mjs generate-tests /tmp/axiom-starter/app.ax --examples /tmp/axiom-starter/axiom/simulations.json --out /tmp/axiom-starter/generated-tests
node --test /tmp/axiom-starter/generated-tests/axiom-policy.test.mjs
```

- `axiom init --guided` gives a small template and agent-instruction picker.
- `axiom next` gives one compact next action for an agent.
- TypeScript and Python targets generate policy artifacts.
- Node and Python examples import generated policy evaluators from ordinary app code.
- CI validates examples, runs demos, runs tests, and checks package contents with `npm pack --dry-run`.
- Public copy says the repo is a development preview and does not claim production security guarantees.

## Pre-Release Checks

- Keep `"private": true` until npm publication is intentional.
- Confirm public GitHub URLs in README and site links before announcing a public repository.
- Re-run `npm pack --dry-run` in CI or an npm-capable shell before npm publication.
- Review public HTML pages whenever the project status changes from private development to public repository.

## Project Hygiene

- Contribution guidance exists for examples, validation rules, and generator targets.
- A security policy explains what Axiom does and does not protect.
- Issue templates exist for bugs, language proposals, and example requests.
- A release checklist exists for public repository and npm publication steps.

## Explicit Non-Blockers

- FastAPI scaffolding is not required for the current experimental release.
- `axiom verify` bundles are not required for the current experimental release.
- Hosted services, dashboards, org policy packs, and enterprise/government controls are not part of the open-source release bar.
- Axiom does not need to generate full applications before it can be useful as a contract and policy artifact tool.

## Status Summary

Axiom OS is close to release-ready as an experimental developer tool. The remaining work is mostly release hygiene and public-surface accuracy, not core architecture.
