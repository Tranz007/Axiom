#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseAxiom } from "../src/parser.mjs";
import { validateGraph } from "../src/validator.mjs";
import { generateArtifacts } from "../src/generator.mjs";

const command = process.argv[2];
const input = process.argv[3];

function usage() {
  console.log(`Axiom CLI

Usage:
  axiom validate <file.ax>
  axiom explain <file.ax>
  axiom matrix <file.ax>
  axiom generate <file.ax> [--target typescript] [--out generated]
`);
}

function optionValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
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
