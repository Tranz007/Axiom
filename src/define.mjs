import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseAxiom } from "./parser.mjs";
import { validateGraph } from "./validator.mjs";

const DEFAULT_OUTLINE_PATH = "axiom/contract-outline.md";

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function listOrNone(values) {
  return values?.length ? values.join(", ") : "none yet";
}

function splitList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function graphSummary(graph, diagnostics) {
  if (!graph) return ["No `app.ax` was found. This outline is for a new contract."];

  const errors = diagnostics.filter((item) => item.severity === "error").length;
  const warnings = diagnostics.filter((item) => item.severity === "warning").length;
  return [
    `Existing app: ${graph.app?.name || "unnamed"}`,
    `Current shape: ${graph.capabilities.length} capabilities, ${graph.actors.length} actors, ${graph.dataClasses.length} data classes`,
    `Validation: ${errors} errors, ${warnings} warnings`,
    `Actors: ${listOrNone(graph.actors.map((actor) => actor.name))}`,
    `Data classes: ${listOrNone(graph.dataClasses.map((dataClass) => `${dataClass.name} (${dataClass.sensitivity})`))}`,
    `Capabilities: ${listOrNone(graph.capabilities.map((capability) => capability.name))}`,
  ];
}

function bulletList(values, fallback = "- [ ] ") {
  if (!values?.length) return [fallback];
  return values.map((value) => `- [ ] ${value}`);
}

function formatOutline({ cwd, appPath, graph, diagnostics, answers = {} }) {
  const appPurpose = answers.purpose || "";
  const primaryUsers = splitList(answers.users);
  const agentUse = answers.agentUse || "";
  const sensitiveData = splitList(answers.sensitiveData);
  const capabilities = splitList(answers.capabilities);
  const approvals = splitList(answers.approvals);
  const forbidden = splitList(answers.forbidden);
  const audit = splitList(answers.audit);

  return `# Axiom Contract Outline

Use this worksheet to create or update \`app.ax\`.

Axiom is set by the contract file. The human describes the rules here, then the coding agent updates \`app.ax\`, runs Axiom checks, and implements ordinary app code against the contract.

## Current Contract

- Project folder: \`${cwd}\`
- Contract path: \`${appPath}\`
${graphSummary(graph, diagnostics).map((line) => `- ${line}`).join("\n")}

## App Purpose

What is this app for?

${appPurpose ? appPurpose : "_Write one or two plain-language sentences._"}

## People And Agents

Who can use the app or request actions?

${bulletList(primaryUsers).join("\n")}

Will an AI agent act inside this app? If yes, what should it be allowed to request?

${agentUse || "_Example: A coding/support/research agent can request narrow capabilities, but cannot read raw private records or decide policy._"}

## Sensitive Or Important Data

Name the private, sensitive, regulated, or business-critical data the app may touch.

${bulletList(sensitiveData, "- [ ] data name, sensitivity, allowed safe form").join("\n")}

## Allowed Capabilities

Name the narrow actions the app or agent may request. Keep these small and specific.

${bulletList(capabilities, "- [ ] capability name, purpose, data involved").join("\n")}

## Approval Required

Which actions should require a human approval or stronger policy check?

${bulletList(approvals, "- [ ] action, approver, what approval must bind").join("\n")}

## Must Never Happen

What should the agent or app never do?

${bulletList(forbidden, "- [ ] forbidden behavior").join("\n")}

## Audit

What should be recorded when sensitive data or important actions are involved?

${bulletList(audit, "- [ ] event to record, and raw value that must never be logged").join("\n")}

## Next Step For The Coding Agent

Ask the coding agent to:

1. Update \`app.ax\` from this outline.
2. Run \`axiom validate app.ax\`.
3. Add or update \`axiom/simulations.json\` for the important allow, approval, and deny paths.
4. Run \`axiom doctor\`.
5. Run \`axiom next\`.
6. Summarize only the changed capability, data class, policy, approval, or audit behavior.

Do not ask the model to decide policy. Use the model to help draft the contract, then let deterministic Axiom checks verify the shape.
`;
}

export async function createContractOutline(options = {}) {
  const cwd = resolve(options.cwd || ".");
  const appPath = resolve(cwd, options.app || "app.ax");
  const outPath = resolve(cwd, options.out || DEFAULT_OUTLINE_PATH);
  const force = Boolean(options.force);
  let graph = null;
  let diagnostics = [];

  if (!force && (await exists(outPath))) {
    throw new Error(`${outPath} already exists. Use --force to overwrite it.`);
  }

  if (await exists(appPath)) {
    const source = await readFile(appPath, "utf8");
    graph = parseAxiom(source, appPath);
    diagnostics = validateGraph(graph);
  }

  const outline = formatOutline({
    cwd,
    appPath,
    graph,
    diagnostics,
    answers: options.answers || {},
  });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, outline, "utf8");

  return { cwd, appPath, outPath, graph, diagnostics };
}

export function formatDefineResult(result) {
  const mode = result.graph ? "update" : "new contract";
  return [
    "Axiom contract definition",
    "",
    `Mode: ${mode}`,
    `Wrote: ${result.outPath}`,
    "",
    "Next:",
    "1. Fill in the outline in plain language.",
    "2. Ask your coding agent to update app.ax from the outline.",
    "3. Run axiom validate app.ax, then axiom doctor and axiom next.",
  ].join("\n");
}
