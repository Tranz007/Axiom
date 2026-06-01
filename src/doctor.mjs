import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { parseAxiom } from "./parser.mjs";
import { validateGraph } from "./validator.mjs";

const AGENT_INSTRUCTION_PATHS = [
  "AGENTS.md",
  "CLAUDE.md",
  ".cursor/rules/axiom.md",
  "instructions.md",
];

const GENERATED_HINT_PATHS = [
  "generated/policy-matrix.json",
  "generated/capabilities.ts",
  "generated/policy-evaluator.ts",
];

const SIMULATION_RESULTS_PATH = "axiom/simulation-results.json";

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function check(status, label, detail, next) {
  return { status, label, detail, next };
}

export async function inspectProject(options = {}) {
  const cwd = resolve(options.cwd || ".");
  const appPath = resolve(cwd, options.app || "app.ax");
  const checks = [];
  let graph = null;
  let diagnostics = [];

  if (await exists(appPath)) {
    checks.push(check("ok", "app.ax found", appPath));
    const source = await readFile(appPath, "utf8");
    graph = parseAxiom(source, appPath);
    diagnostics = validateGraph(graph);
    const errors = diagnostics.filter((item) => item.severity === "error");
    const warnings = diagnostics.filter((item) => item.severity === "warning");

    if (errors.length) {
      checks.push(
        check(
          "error",
          "app.ax has validation errors",
          `${errors.length} error(s), ${warnings.length} warning(s)`,
          `Run: axiom validate ${appPath}`,
        ),
      );
    } else if (warnings.length) {
      checks.push(
        check(
          "warn",
          "app.ax validates with warnings",
          `${warnings.length} warning(s)`,
          `Run: axiom validate ${appPath}`,
        ),
      );
    } else {
      checks.push(check("ok", "app.ax validates", "0 errors, 0 warnings"));
    }
  } else {
    checks.push(
      check(
        "error",
        "app.ax missing",
        `No Axiom contract found at ${appPath}`,
        "Run: axiom init --template local-private-app --agent codex",
      ),
    );
  }

  const foundInstruction = await findExisting(cwd, AGENT_INSTRUCTION_PATHS);
  if (foundInstruction) {
    checks.push(check("ok", "agent instructions found", foundInstruction));
  } else {
    checks.push(
      check(
        "warn",
        "agent instructions missing",
        "No AGENTS.md, CLAUDE.md, Cursor rule, or generic instructions file found.",
        "Run: axiom init --agent codex --force only if you want to overwrite app.ax",
      ),
    );
  }

  const simulationsPath = join(cwd, "axiom", "simulations.json");
  if (await exists(simulationsPath)) {
    checks.push(check("ok", "simulation hints found", simulationsPath));
    const simulationResultsPath = join(cwd, SIMULATION_RESULTS_PATH);
    if (await exists(simulationResultsPath)) {
      checks.push(check("ok", "simulation results found", simulationResultsPath));
    } else {
      checks.push(
        check(
          "info",
          "simulation results not found",
          "Simulation hints exist, but no saved result file was found.",
          `Run one example from ${simulationsPath}`,
        ),
      );
    }
  } else {
    checks.push(
      check(
        "warn",
        "simulation hints missing",
        "No axiom/simulations.json file found.",
        "Add simulation examples for your most important capabilities.",
      ),
    );
  }

  const generated = [];
  for (const path of GENERATED_HINT_PATHS) {
    const fullPath = join(cwd, path);
    if (await exists(fullPath)) generated.push(path);
  }

  if (generated.length) {
    checks.push(check("ok", "generated artifacts found", generated.join(", ")));
  } else {
    checks.push(
      check(
        "info",
        "generated artifacts not found",
        "This is fine for a new project.",
        graph ? `Run: axiom generate ${appPath} --target typescript --out generated` : null,
      ),
    );
  }

  return {
    cwd,
    appPath,
    graph,
    diagnostics,
    checks,
  };
}

async function findExisting(cwd, paths) {
  for (const path of paths) {
    const fullPath = join(cwd, path);
    if (await exists(fullPath)) return fullPath;
  }
  return null;
}

export function formatDoctorReport(report) {
  const lines = ["Axiom project health", ""];
  for (const item of report.checks) {
    const label = item.status.toUpperCase().padEnd(5, " ");
    lines.push(`${label} ${item.label}`);
    if (item.detail) lines.push(`      ${item.detail}`);
    if (item.next) lines.push(`      ${item.next}`);
  }

  const errors = report.checks.filter((item) => item.status === "error").length;
  const warnings = report.checks.filter((item) => item.status === "warn").length;
  lines.push("");
  if (errors) {
    lines.push(`Result: ${errors} blocking issue(s).`);
  } else if (warnings) {
    lines.push(`Result: usable, with ${warnings} thing(s) to improve.`);
  } else {
    lines.push("Result: ready.");
  }

  return lines.join("\n");
}

export function doctorExitCode(report) {
  return report.checks.some((item) => item.status === "error") ? 1 : 0;
}

function hasCheck(report, status, label) {
  return report.checks.some((item) => item.status === status && item.label === label);
}

function firstCheck(report, status, label) {
  return report.checks.find((item) => item.status === status && item.label === label);
}

export function recommendNextAction(report) {
  const missingApp = firstCheck(report, "error", "app.ax missing");
  if (missingApp) {
    return {
      action: "axiom init --template local-private-app --agent codex",
      why: "No Axiom contract was found. Axiom needs app.ax before an agent starts adding authority-bearing code.",
      after: "Run axiom doctor.",
    };
  }

  const validationErrors = firstCheck(report, "error", "app.ax has validation errors");
  if (validationErrors) {
    return {
      action: `axiom validate ${report.appPath}`,
      why: "The contract exists, but it has blocking authority or policy issues.",
      after: "Fix the reported errors, then run axiom doctor again.",
    };
  }

  const missingInstructions = firstCheck(report, "warn", "agent instructions missing");
  if (missingInstructions) {
    return {
      action: "axiom init --agent codex --force",
      why: "A human may install Axiom, but the coding agent needs project instructions that tell it to use app.ax before implementation code.",
      after: "Review the generated instructions before continuing.",
    };
  }

  const warningValidation = firstCheck(report, "warn", "app.ax validates with warnings");
  if (warningValidation) {
    return {
      action: `axiom validate ${report.appPath}`,
      why: "The contract is usable, but warnings may point to unclear safety boundaries.",
      after: "Decide whether to tighten the contract or continue with the warning understood.",
    };
  }

  const missingSimulations = firstCheck(report, "warn", "simulation hints missing");
  if (missingSimulations) {
    return {
      action: "Add axiom/simulations.json with one allow and one require_approval or deny example.",
      why: "Agents need concrete policy scenarios so they can test behavior instead of guessing.",
      after: "Run axiom doctor.",
    };
  }

  const missingSimulationResults = firstCheck(report, "info", "simulation results not found");
  if (missingSimulationResults) {
    return {
      action: "Run one command from axiom/simulations.json",
      why: "The contract validates, but agents should test at least one policy path before generating implementation artifacts.",
      after: "Then run axiom next again.",
    };
  }

  if (hasCheck(report, "info", "generated artifacts not found")) {
    return {
      action: `axiom generate ${report.appPath} --target typescript --out generated`,
      why: "The contract is ready. Generated artifacts make it easier for implementation code to stay aligned with app.ax.",
      after: "Implement against the generated contracts and keep app.ax as the authority source.",
    };
  }

  return {
    action: "Implement the next feature against app.ax.",
    why: "Axiom has a valid contract, agent instructions, simulation hints, and generated artifacts.",
    after: "When authority, sensitive data, effects, approvals, or audit behavior changes, update app.ax first.",
  };
}

export function formatNextAction(report) {
  const recommendation = recommendNextAction(report);
  return [
    "Axiom next action",
    "",
    `Next: ${recommendation.action}`,
    "",
    `Why: ${recommendation.why}`,
    "",
    `After: ${recommendation.after}`,
  ].join("\n");
}
