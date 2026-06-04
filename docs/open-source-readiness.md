# Open Source Readiness

This is the current readiness checkpoint for opening Axiom OS.

Axiom should not be opened just because the concept is interesting. It should be opened when a developer or advanced AI-assisted builder can run the first loop, inspect the generated artifacts, understand the limits, and see enough proof that the contract model is real.

## Ready Now

- Fresh-project flow works:

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

## Must Fix Before Opening

- Decide the public repository state: keep `"private": true` until npm publication is intentional, or remove it only when ready to publish.
- Confirm the public GitHub URL in README and site links once the repo is actually public.
- Re-run `npm pack --dry-run` in CI or an npm-capable shell immediately before opening.
- Do one final pass over public HTML pages for links that assume private-only development.

## Should Fix Soon After Opening

- Add contribution guidance for small examples, validation rules, and generator targets.
- Add a short security policy that explains what Axiom does and does not protect.
- Add issue templates for bugs, language proposals, and example requests.
- Add a release checklist for future npm publication.

## Explicit Non-Blockers

- FastAPI scaffolding is not required before opening.
- `axiom verify` bundles are not required before opening.
- Hosted services, dashboards, org policy packs, and enterprise/government controls are not part of the open-source release bar.
- Axiom does not need to generate full applications before it can be useful as a contract and policy artifact tool.

## Current Judgment

Axiom OS is close to open-source-ready as an experimental developer tool. The remaining blockers are mostly release hygiene and public-surface accuracy, not core architecture.
