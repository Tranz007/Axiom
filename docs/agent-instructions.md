# Axiom Agent Instructions

Axiom OS needs to work for people who build with AI coding agents, not only for experienced software engineers.

Many users will not begin by reading the Axiom language spec. They will begin by asking Codex, Claude, Cursor, Copilot, or another agent to build an app. Axiom needs an instruction layer that tells those agents how to introduce capability contracts before implementation code drifts into unsafe authority.

This instruction layer is not the source of truth. The `.ax` contract remains the source of truth.

The instruction layer is the bridge:

```text
user prompt
  -> agent instructions
  -> starter app.ax
  -> validation and simulation
  -> generated contracts
  -> implementation code
```

## Goal

The goal is that a non-expert user can tell an AI coding agent:

> Build this app, but use Axiom to define what the app and any agents are allowed to do before writing implementation code.

The agent should then:

1. identify sensitive data
2. identify actors and agents
3. identify external or irreversible effects
4. create or update `app.ax`
5. define narrow capabilities
6. add deterministic policy
7. add approvals where needed
8. add broker and audit obligations
9. run Axiom validation
10. avoid routes or tools that bypass the contract

## Copy-Paste Starter Instruction

This is the minimum instruction a user should be able to paste into a coding agent:

```text
Use Axiom before writing implementation code.

Create or update app.ax as the source of truth for this app's intent, actors, sensitive data, capabilities, policy, approvals, external effects, broker behavior, and audit obligations.

Do not add routes, tools, background jobs, or UI actions that bypass app.ax.

If the app handles private data, money, identity, credentials, documents, messages, health data, business data, government data, or irreversible external actions, define narrow capabilities and deterministic policy before implementing those actions.

Models may help draft code and summaries, but models must not make final allow, deny, approval, sensitivity, or disclosure decisions.

Run Axiom validation and explain any errors before continuing.
```

## Codex-Oriented Project Instruction

For Codex-style projects, Axiom should be able to generate an `AGENTS.md` file like this:

```md
# Axiom Project Instructions

Before making implementation changes, inspect `app.ax`.

Treat `app.ax` as the authority source for:

- application intent
- actors and agents
- sensitive data classes
- capabilities
- deterministic policy decisions
- approval requirements
- broker boundaries
- external effects
- audit obligations
- invariants

When adding a feature:

1. Update `app.ax` first if the feature changes data access, agent authority, approval behavior, external effects, or audit requirements.
2. Run `axiom validate app.ax`.
3. Run `axiom simulate` for changed capabilities when relevant.
4. Do not create generic retrieval, export, search-all, or raw secret routes for agents unless explicitly modeled and allowed in `app.ax`.
5. Do not let model output decide final access, approval, disclosure mode, or sensitivity.
6. Keep brokered sensitive data inside declared broker boundaries.
7. Never log raw secrets, decrypted payloads, approval tokens, auth headers, or plaintext sensitive records.
8. If a requested change violates `app.ax`, explain the violation and propose a narrower capability or approval-gated flow.

Implementation code may be hand-written, but it must satisfy the Axiom contract.
```

## Guided Questions

For less technical users, Axiom should not start with syntax. It should ask guided questions and generate a starter contract.

Questions:

```text
What is the app for?
Who uses it?
Will an AI agent use tools or take actions?
What private or sensitive data does the app handle?
Can data leave the app?
Can the app send messages, submit forms, spend money, delete data, publish content, or call external APIs?
Which actions should require human approval?
What should never be logged?
What should an agent never be able to retrieve?
```

Output:

```text
app.ax
AGENTS.md
README.md safety notes
example policy simulations
generated TypeScript or Python contracts
```

## CLI Flow

The first implementation is intentionally simple:

```bash
axiom init --template local-private-app --agent codex --out my-axiom-app
```

Available app templates:

```text
local-private-app
agent-gateway
sensitive-upload-app
approval-gated-automation
```

Available agent instruction targets:

```text
codex
claude
cursor
generic
```

List available templates:

```bash
axiom init --list
```

Generated files:

```text
app.ax
AGENTS.md
axiom/
  simulations.json
```

The user can then run:

```bash
axiom doctor --cwd my-axiom-app
axiom next --cwd my-axiom-app
axiom simulate-examples --cwd my-axiom-app
axiom validate my-axiom-app/app.ax
axiom simulate my-axiom-app/app.ax --capability summarize_private_document --fact owner_authenticated=true
```

`axiom doctor` should stay intentionally lightweight. It is not a compliance scanner. It tells the user whether the project has:

- an Axiom contract
- agent instructions
- a valid `app.ax`
- simulation hints
- generated artifacts or a next command to create them

`axiom next` is the agent-facing companion command. A human installs Axiom, but an AI coding agent often needs to decide what to do next inside the repo. `axiom next` returns one recommended action, why it matters, and what should happen afterward.

`axiom simulate-examples` runs the generated policy examples and writes `axiom/simulation-results.json`. This keeps the first agent workflow honest: validate the contract, simulate at least one policy path, then generate artifacts.

The future interactive version should ask:

```text
What are you building?
1. Local private app
2. Agent tool gateway
3. Personal data broker
4. Approval-gated automation
5. Sensitive upload app

Which agent instructions should Axiom generate?
1. Codex AGENTS.md
2. Claude CLAUDE.md
3. Cursor rules
4. Generic instructions.md
```

## Why This Matters

Without this layer, Axiom risks being useful only to people who already think in policy, threat models, and capability contracts.

The broader consumer/developer audience needs an easier starting point:

```text
describe the app
answer safety questions
let Axiom draft the contract
let the AI coding agent implement against the contract
```

This does not remove the need for engineering judgment. Axiom should not claim that non-developers can safely ship high-risk production systems alone.

The realistic promise is narrower:

> Axiom gives AI-assisted builders a safer default path by making the coding agent define authority before it writes authority-bearing code.

## Implementation Order

1. Add static instruction templates for `AGENTS.md`, `CLAUDE.md`, Cursor rules, and generic `instructions.md`. Done.
2. Add `axiom init --agent codex` to copy a template plus starter `app.ax`. Done.
3. Add app-type templates such as local private app, agent gateway, sensitive upload app, and approval-gated automation. Done.
4. Add guided prompts that generate starter contracts from answers.
5. Add `axiom doctor` to explain whether the project has Axiom instructions, a valid contract, generated artifacts, and runnable simulations. Done.
6. Add `axiom next` so coding agents can ask for the next useful action instead of inferring it from docs. Done.
7. Add `axiom simulate-examples` so the first workflow tests policy behavior before generation. Done.

This should come before large framework code generation. Adoption depends on first contact being easy.
