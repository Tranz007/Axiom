# First Agent Loop

This is the Axiom OS golden path.

A human installs Axiom. The coding agent runs small commands and follows the next action. Do not paste full contracts, generated artifacts, or reports into model context unless the user asks.

## Fresh Project

Start with a guided template:

```bash
axiom init --guided --out my-axiom-app
```

Or use the default local private app:

```bash
axiom init --template local-private-app --agent codex --out my-axiom-app
```

Then let Axiom drive the agent:

```bash
axiom next --cwd my-axiom-app
axiom simulate-examples --cwd my-axiom-app
axiom next --cwd my-axiom-app
axiom generate my-axiom-app/app.ax --target typescript --out my-axiom-app/generated
axiom next --cwd my-axiom-app
axiom generate-tests my-axiom-app/app.ax --examples my-axiom-app/axiom/simulations.json --out my-axiom-app/generated-tests
axiom next --cwd my-axiom-app
node --test my-axiom-app/generated-tests/axiom-policy.test.mjs
```

## What The Agent Should Do

- Run `axiom next` before guessing.
- Run the command Axiom recommends.
- Summarize only the result and the changed capability, policy, or generated artifact.
- Keep `app.ax` as the source of truth.
- If `app.ax` changes, run `axiom next` again.

## Expected Shape

The loop should stay compact:

```text
Next: one command
Why: one reason
After: one follow-up
```

That is the product: Axiom gives the agent the next small move without filling the context window.
