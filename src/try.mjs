import { join } from "node:path";
import { rm } from "node:fs/promises";
import { initProject } from "./init.mjs";
import { formatDoctorReport, formatNextAction, inspectProject } from "./doctor.mjs";
import { formatSimulationExampleResults, runSimulationExamples } from "./simulations.mjs";

export async function runTryProject(options = {}) {
  const outDir = options.outDir || "axiom-starter";
  const template = options.template || "local-private-app";
  const agent = options.agent || "codex";
  const force = Boolean(options.force);

  const init = await initProject({ outDir, template, agent, force });
  await rm(join(init.outDir, "axiom", "simulation-results.json"), { force: true });
  const firstDoctor = await inspectProject({ cwd: init.outDir });
  const simulations = await runSimulationExamples({ cwd: init.outDir });
  const nextReport = await inspectProject({ cwd: init.outDir });

  return {
    outDir: init.outDir,
    template: init.template,
    agent: init.agent,
    written: init.written,
    firstDoctor,
    simulations,
    nextReport,
    appPath: join(init.outDir, "app.ax"),
  };
}

export function formatTryProject(result) {
  return [
    "Axiom two-minute try",
    "",
    `Created: ${result.outDir}`,
    `Template: ${result.template}`,
    `Agent instructions: ${result.agent}`,
    "",
    "Files:",
    ...result.written.map((file) => `  - ${file}`),
    "",
    formatDoctorReport(result.firstDoctor),
    "",
    formatSimulationExampleResults(result.simulations),
    "",
    formatNextAction(result.nextReport),
    "",
    "You can now point your coding agent at this folder and ask it to follow the next action.",
  ].join("\n");
}
