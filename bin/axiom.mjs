#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { dirname, resolve } from "node:path";
import { parseAxiom } from "../src/parser.mjs";
import { validateGraph } from "../src/validator.mjs";
import { generateArtifacts } from "../src/generator.mjs";
import { evaluateAxiomPolicy, parseFactList } from "../src/runtime.mjs";
import { initProject, listInitTemplates } from "../src/init.mjs";
import { doctorExitCode, formatDoctorReport, formatNextAction, inspectProject } from "../src/doctor.mjs";
import { formatSimulationExampleResults, runSimulationExamples } from "../src/simulations.mjs";
import { generateNodeTests } from "../src/testgen.mjs";
import { diffGraphs, formatGraphDiff } from "../src/diff.mjs";
import { formatTryProject, runTryProject } from "../src/try.mjs";
import { createContractOutline, formatDefineResult } from "../src/define.mjs";

const command = process.argv[2];
const input = process.argv[3];

function usage() {
  console.log(`Axiom CLI

Usage:
  axiom init [--template local-private-app] [--agent codex] [--out .] [--force]
  axiom init --guided [--out .] [--force]
  axiom init --list
  axiom try [--template local-private-app] [--agent codex] [--out axiom-starter] [--force]
  axiom define [--cwd .] [--app app.ax] [--out axiom/contract-outline.md] [--guided] [--force]
  axiom doctor [--cwd .] [--app app.ax]
  axiom next [--cwd .] [--app app.ax]
  axiom simulate-examples [--cwd .] [--app app.ax]
  axiom validate <file.ax>
  axiom explain <file.ax>
  axiom matrix <file.ax>
  axiom simulate <file.ax> --capability <key> [--fact name=true ...]
  axiom diff <old.ax> <new.ax>
  axiom generate <file.ax> [--target typescript|python] [--out generated]
  axiom generate-tests <file.ax> [--examples axiom/simulations.json] [--target node] [--out generated-tests]
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

function printChoiceQuestion(question, choices, fallback) {
  console.log(question);
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.label}`);
  });
  process.stdout.write(`Choose 1-${choices.length} [${fallback}]: `);
}

function resolveChoice(answer, choices, fallback) {
  const index = Number.parseInt(answer, 10);
  const choice = choices[index - 1] || choices.find((item) => item.value === fallback);
  return choice.value;
}

async function askChoice(reader, question, choices, fallback) {
  printChoiceQuestion(question, choices, fallback);
  const answer = (await reader.question("")).trim();
  console.log("");
  return resolveChoice(answer, choices, fallback);
}

async function guidedInitOptions() {
  const templateChoices = [
    { value: "local-private-app", label: "Local private app" },
    { value: "agent-gateway", label: "Agent tool gateway" },
    { value: "sensitive-upload-app", label: "Sensitive upload app" },
    { value: "approval-gated-automation", label: "Approval-gated automation" },
  ];
  const agentChoices = [
    { value: "codex", label: "Codex AGENTS.md" },
    { value: "claude", label: "Claude CLAUDE.md" },
    { value: "cursor", label: "Cursor rules" },
    { value: "generic", label: "Generic instructions.md" },
  ];

  if (!process.stdin.isTTY) {
    let input = "";
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    const answers = input.split(/\r?\n/);
    console.log("Axiom guided init");
    console.log("");
    printChoiceQuestion("What are you building?", templateChoices, "local-private-app");
    console.log("");
    printChoiceQuestion("Which agent instructions should Axiom generate?", agentChoices, "codex");
    console.log("");
    return {
      template: resolveChoice((answers[0] || "").trim(), templateChoices, "local-private-app"),
      agent: resolveChoice((answers[1] || "").trim(), agentChoices, "codex"),
    };
  }

  const reader = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Axiom guided init");
    console.log("");
    const template = await askChoice(reader, "What are you building?", templateChoices, "local-private-app");
    const agent = await askChoice(reader, "Which agent instructions should Axiom generate?", agentChoices, "codex");

    return { template, agent };
  } finally {
    reader.close();
  }
}

function printQuestion(question) {
  process.stdout.write(`${question}\n> `);
}

async function guidedDefineAnswers() {
  const questions = [
    ["purpose", "What is this app for?"],
    ["users", "Who uses it or requests actions? Separate multiple answers with commas."],
    ["agentUse", "Will an AI agent act inside this app? What should it be allowed to request?"],
    ["sensitiveData", "What private, sensitive, or business-critical data may it touch? Separate with commas."],
    ["capabilities", "What narrow actions should the app or agent be allowed to request? Separate with commas."],
    ["approvals", "Which actions should require approval? Separate with commas."],
    ["forbidden", "What must never happen? Separate with commas."],
    ["audit", "What should be audited? Separate with commas."],
  ];

  if (!process.stdin.isTTY) {
    let input = "";
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    const lines = input.split(/\r?\n/);
    console.log("Axiom contract definition");
    console.log("");
    const answers = {};
    questions.forEach(([key, question], index) => {
      printQuestion(question);
      console.log("");
      answers[key] = (lines[index] || "").trim();
    });
    return answers;
  }

  const reader = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Axiom contract definition");
    console.log("");
    const answers = {};
    for (const [key, question] of questions) {
      printQuestion(question);
      answers[key] = (await reader.question("")).trim();
      console.log("");
    }
    return answers;
  } finally {
    reader.close();
  }
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
    if (item.missing?.length) console.log(`  missing: ${item.missing.join(", ")}`);
    if (item.why) console.log(`  why it matters: ${item.why}`);
    if (item.try?.length) {
      console.log("  try:");
      for (const suggestion of item.try) {
        console.log(`    - ${suggestion}`);
      }
    }
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
  if (!command || command === "help" || command === "--help" || command === "-h" || hasOption("--help") || hasOption("-h")) {
    usage();
    process.exit(0);
  }

  if (command === "init") {
    if (hasOption("--list")) {
      console.log(JSON.stringify(await listInitTemplates(), null, 2));
      process.exit(0);
    }

    const guided = hasOption("--guided") ? await guidedInitOptions() : {};
    const result = await initProject({
      template: optionValue("--template", guided.template || "local-private-app"),
      agent: optionValue("--agent", guided.agent || "codex"),
      outDir: optionValue("--out", "."),
      force: hasOption("--force"),
    });

    console.log(`initialized ${result.template} for ${result.agent} in ${result.outDir}`);
    for (const file of result.written) {
      console.log(`created ${file}`);
    }
    process.exit(0);
  }

  if (command === "try") {
    const result = await runTryProject({
      template: optionValue("--template", "local-private-app"),
      agent: optionValue("--agent", "codex"),
      outDir: optionValue("--out", "axiom-starter"),
      force: hasOption("--force"),
    });
    console.log(formatTryProject(result));
    process.exit(0);
  }

  if (command === "define") {
    const answers = hasOption("--guided") ? await guidedDefineAnswers() : {};
    const result = await createContractOutline({
      cwd: optionValue("--cwd", "."),
      app: optionValue("--app", "app.ax"),
      out: optionValue("--out", "axiom/contract-outline.md"),
      force: hasOption("--force"),
      answers,
    });
    console.log(formatDefineResult(result));
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

  if (command === "generate-tests") {
    if (!input) {
      usage();
      process.exit(2);
    }

    const result = await generateNodeTests({
      appPath: input,
      examplesPath: optionValue("--examples", "axiom/simulations.json"),
      target: optionValue("--target", "node"),
      outDir: optionValue("--out", "generated-tests"),
    });
    console.log(`generated ${result.testPath}`);
    process.exit(0);
  }

  if (command === "diff") {
    const oldFile = input;
    const newFile = process.argv[4];
    if (!oldFile || !newFile) {
      usage();
      process.exit(2);
    }

    const oldGraph = await loadGraph(oldFile);
    const newGraph = await loadGraph(newFile);
    console.log(formatGraphDiff(diffGraphs(oldGraph.graph, newGraph.graph)));
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
    if (diagnostics.some((item) => item.severity === "error")) {
      printDiagnostics(diagnostics);
      throw new Error("Cannot generate artifacts from a graph with validation errors.");
    }

    const artifacts = generateArtifacts(graph, diagnostics, { sourcePath, target });
    await mkdir(outDir, { recursive: true });
    for (const artifact of artifacts) {
      const artifactPath = resolve(outDir, artifact.path);
      await mkdir(dirname(artifactPath), { recursive: true });
      await writeFile(artifactPath, artifact.contents, "utf8");
      console.log(`generated ${artifactPath}`);
    }
    process.exit(0);
  }

  usage();
  process.exit(2);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
