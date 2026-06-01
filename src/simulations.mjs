import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { parseAxiom } from "./parser.mjs";
import { evaluateAxiomPolicy, parseFactList } from "./runtime.mjs";
import { validateGraph } from "./validator.mjs";

function parseSimulationCommand(command) {
  const parts = command.trim().split(/\s+/);
  const capabilityIndex = parts.indexOf("--capability");
  if (capabilityIndex === -1 || !parts[capabilityIndex + 1]) {
    throw new Error(`Simulation command is missing --capability: ${command}`);
  }

  const facts = [];
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index] === "--fact" && parts[index + 1]) facts.push(parts[index + 1]);
  }

  return {
    capability: parts[capabilityIndex + 1],
    facts: parseFactList(facts),
  };
}

export async function runSimulationExamples(options = {}) {
  const cwd = resolve(options.cwd || ".");
  const appPath = resolve(cwd, options.app || "app.ax");
  const hintsPath = resolve(cwd, "axiom", "simulations.json");
  const resultsPath = resolve(cwd, "axiom", "simulation-results.json");

  const source = await readFile(appPath, "utf8");
  const graph = parseAxiom(source, appPath);
  const diagnostics = validateGraph(graph);
  const errors = diagnostics.filter((item) => item.severity === "error");
  if (errors.length) {
    throw new Error(`Cannot run simulation examples because app.ax has ${errors.length} validation error(s).`);
  }

  const hints = JSON.parse(await readFile(hintsPath, "utf8"));
  const examples = Array.isArray(hints.examples) ? hints.examples : [];
  if (!examples.length) {
    throw new Error("No simulation examples found in axiom/simulations.json.");
  }

  const results = examples.map((example) => {
    const parsed = parseSimulationCommand(example.command);
    return {
      description: example.description || "",
      command: example.command,
      result: evaluateAxiomPolicy(graph, parsed.capability, parsed.facts),
    };
  });

  await mkdir(dirname(resultsPath), { recursive: true });
  await writeFile(
    resultsPath,
    `${JSON.stringify(
      {
        app: graph.app?.name || "unknown",
        source: appPath,
        results,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  return { cwd, appPath, hintsPath, resultsPath, results };
}

export function formatSimulationExampleResults(report) {
  const lines = ["Axiom simulation examples", ""];
  for (const item of report.results) {
    lines.push(`${item.result.decision.toUpperCase()} ${item.description || item.result.capability}`);
    lines.push(`      ${item.command}`);
    lines.push(`      reasons: ${item.result.reasons.join(", ") || "none"}`);
  }
  lines.push("");
  lines.push(`saved ${report.resultsPath}`);
  return lines.join("\n");
}

