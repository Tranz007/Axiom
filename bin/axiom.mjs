#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseAxiom } from "../src/parser.mjs";
import { validateGraph } from "../src/validator.mjs";
import { generateArtifacts } from "../src/generator.mjs";
import { evaluateAxiomPolicy, parseFactList } from "../src/runtime.mjs";
import { initProject, listInitTemplates } from "../src/init.mjs";
import { doctorExitCode, formatDoctorReport, formatNextAction, inspectProject } from "../src/doctor.mjs";
import { formatSimulationExampleResults, runSimulationExamples } from "../src/simulations.mjs";

const command = process.argv[2];
const input = process.argv[3];

function usage() {
  console.log(`Axiom CLI

Usage:
  axiom init [--template local-private-app] [--agent codex] [--out .] [--force]
  axiom init --list
  axiom doctor [--cwd .] [--app app.ax]
  axiom next [--cwd .] [--app app.ax]
  axiom simulate-examples [--cwd .] [--app app.ax]
  axiom validate <file.ax>
  axiom explain <file.ax>
  axiom matrix <file.ax>
  axiom simulate <file.ax> --capability <key> [--fact name=true ...]
  axiom generate <file.ax> [--target typescript] [--out generated]
`);
}

function optionValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
}

function optionValues(name) {
  const values = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name && process.argv[index + 1]) {
      values.push(process.argv[index + 1]);
    }
  }
  return values;
}

function hasOption(name) {
  return process.argv.includes(name);
}

async function loadGraph(file) {
  if (!file) {
    usage();
    process.exit(2);
  }

  const sourcePath = resolve(file);
  const source = await readFile(sourcePath, "utf8");
  return { graph: parseAxiom(source, sourcePath), sourcePath };
}

function printDiagnostics(diagnostics) {
  for (const item of diagnostics) {
    const label = item.severity.toUpperCase();
    console.log(`${label}: ${item.message}`);
    if (item.ref) console.log(`  at ${item.ref}`);
  }
}

function printSummary(graph, diagnostics) {
  const errors = diagnostics.filter((item) => item.severity === "error").length;
  const warnings = diagnostics.filter((item) => item.severity === "warning").length;
  console.log(
    `${graph.app?.name || "Axiom program"}: ${graph.capabilities.length} capabilities, ${graph.actors.length} actors, ${graph.dataClasses.length} data classes, ${errors} errors, ${warnings} warnings`,
  );
}

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    process.exit(0);
  }

  if (command === "init") {
    if (hasOption("--list")) {
      console.log(JSON.stringify(await listInitTemplates(), null, 2));
      process.exit(0);
    }

    const result = await initProject({
      template: optionValue("--template", "local-private-app"),
      agent: optionValue("--agent", "codex"),
      outDir: optionValue("--out", "."),
      force: hasOption("--force"),
    });

    console.log(`initialized ${result.template} for ${result.agent} in ${result.outDir}`);
    for (const file of result.written) {
      console.log(`created ${file}`);
    }
    process.exit(0);
  }

  if (command === "doctor") {
    const report = await inspectProject({
      cwd: optionValue("--cwd", "."),
      app: optionValue("--app", null),
    });
    console.log(formatDoctorReport(report));
    process.exit(doctorExitCode(report));
  }

  if (command === "next") {
    const report = await inspectProject({
      cwd: optionValue("--cwd", "."),
      app: optionValue("--app", null),
    });
    console.log(formatNextAction(report));
    process.exit(0);
  }

  if (command === "simulate-examples") {
    const report = await runSimulationExamples({
      cwd: optionValue("--cwd", "."),
      app: optionValue("--app", null),
    });
    console.log(formatSimulationExampleResults(report));
    process.exit(0);
  }

  const { graph, sourcePath } = await loadGraph(input);
  const diagnostics = validateGraph(graph);

  if (command === "validate") {
    printDiagnostics(diagnostics);
    printSummary(graph, diagnostics);
    process.exit(diagnostics.some((item) => item.severity === "error") ? 1 : 0);
  }

  if (command === "explain") {
    printSummary(graph, diagnostics);
    console.log("");
    for (const capability of graph.capabilities) {
      console.log(`capability ${capability.name}`);
      console.log(`  purpose: ${capability.sections.purpose?.join(" ") || "not declared"}`);
      console.log(`  data: ${(capability.sections.data || []).join("; ") || "none declared"}`);
      console.log(`  disclosure: ${(capability.sections.disclosure || []).join("; ") || "none declared"}`);
      console.log(`  policy: ${capability.policy.decisions.map((decision) => decision.kind).join(", ") || "none declared"}`);
      console.log("");
    }
    process.exit(diagnostics.some((item) => item.severity === "error") ? 1 : 0);
  }

  if (command === "matrix") {
    const matrix = graph.capabilities.map((capability) => ({
      capability: capability.name,
      reads: capability.reads,
      disclosureModes: capability.disclosureModes,
      policyDecisions: capability.policy.decisions.map((decision) => decision.kind),
      approval: capability.hasApproval,
      audit: capability.auditEvents,
    }));
    console.log(JSON.stringify(matrix, null, 2));
    process.exit(diagnostics.some((item) => item.severity === "error") ? 1 : 0);
  }

  if (command === "simulate") {
    const capability = optionValue("--capability", null);
    if (!capability) {
      throw new Error("simulate requires --capability <key>");
    }

    if (diagnostics.some((item) => item.severity === "error")) {
      printDiagnostics(diagnostics);
      throw new Error("Cannot simulate a graph with validation errors.");
    }

    const facts = parseFactList(optionValues("--fact"));
    const result = evaluateAxiomPolicy(graph, capability, facts);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.decision === "deny" ? 1 : 0);
  }

  if (command === "generate") {
    const target = optionValue("--target", "typescript");
    const outDir = resolve(optionValue("--out", "generated"));
    const artifacts = generateArtifacts(graph, diagnostics, { sourcePath, target });
    await mkdir(outDir, { recursive: true });
    for (const artifact of artifacts) {
      const artifactPath = resolve(outDir, artifact.path);
      await mkdir(dirname(artifactPath), { recursive: true });
      await writeFile(artifactPath, artifact.contents, "utf8");
      console.log(`generated ${artifactPath}`);
    }
    process.exit(diagnostics.some((item) => item.severity === "error") ? 1 : 0);
  }

  usage();
  process.exit(2);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
