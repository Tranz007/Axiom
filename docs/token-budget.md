# Token Budget

Axiom should reduce what an agent needs to keep in context.

Axiom itself does not connect to an LLM and does not consume model tokens. The
CLI runs locally: `validate`, `doctor`, `next`, `diff`, `simulate`, `generate`,
`verify`, and generated tests are ordinary local commands.

Token cost appears only when a human or coding agent chooses to put Axiom
content into an LLM context window. That can be done well or badly. Pasting a
full language spec, full `app.ax`, generated directory, verification report, or
large docs bundle into chat will waste tokens. Running focused Axiom commands
and summarizing the relevant result should save tokens compared with repeatedly
explaining the same boundaries to a model.

The default rule:

```text
small command output first, full files only when needed
```

## Product Constraint

Axiom is for agents to use while building or changing software. It should not require an agent to paste the full language spec, full `app.ax`, generated reports, or generated artifacts into an LLM context window for every task.

For external models, Axiom should be token-frugal by default:

- run commands instead of pasting files
- summarize changed capabilities, data classes, policy decisions, and approval paths
- reference file paths instead of copying whole artifacts
- use `axiom next` for one practical next step
- use `axiom doctor` for compact project readiness
- use `axiom diff` to show contract changes without dumping both contracts
- use `axiom simulate` for targeted policy paths
- use generated tests to verify behavior outside the model context

Internal or deployed models may use richer context when the user controls the cost and context budget.

## Agent Behavior

Agents should prefer:

```bash
axiom next
axiom doctor
axiom diff old.ax new.ax
axiom simulate app.ax --capability <key> --fact name=true
```

Agents should avoid:

- pasting full generated policy evaluators into chat
- pasting full verification reports unless requested
- loading every Axiom doc for a local implementation task
- treating Axiom as a human-facing governance manual

## Public Claim

The public claim should stay narrow:

```text
Axiom itself does not spend LLM tokens. It is a local CLI and generator.
Token use depends on how a human or coding agent uses Axiom with a model.
The intended workflow is compact local commands, targeted simulations, diffs,
generated tests, and short summaries, not dumping Axiom files into chat.
```

The goal is a simple loop:

```text
human installs Axiom
agent runs focused Axiom commands
agent changes code against the contract
agent summarizes only what changed
```
