import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { generateArtifacts } from "./generator.mjs";
import { parseAxiom } from "./parser.mjs";
import { validateGraph } from "./validator.mjs";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "loc" && key !== "sourcePath")
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortObject(item)]),
  );
}

function canonicalGraph(graph) {
  return {
    app: graph.app,
    actors: graph.actors,
    dataClasses: graph.dataClasses,
    capabilities: graph.capabilities,
    invariants: graph.invariants,
    targets: graph.targets,
  };
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(path) {
  if (!(await exists(path))) return null;
  return readFile(path, "utf8");
}

function manifestFor({ appPath, outDir, target, graph, artifacts, results }) {
  const generatedTests = artifacts
    .filter((artifact) => artifact.path.endsWith(".test.mjs"))
    .map((artifact) => {
      const result = results.find((item) => item.path === artifact.path);
      return {
        path: artifact.path,
        status: result?.status || "missing",
        expectedHash: sha256(artifact.contents),
        actualHash: result?.actualHash || null,
      };
    });

  return {
    axiom: {
      manifestVersion: 1,
      target,
      appPath,
      outDir,
      graphHash: sha256(JSON.stringify(sortObject(canonicalGraph(graph)))),
    },
    artifacts: artifacts.map((artifact) => {
      const result = results.find((item) => item.path === artifact.path);
      return {
        path: artifact.path,
        expectedHash: sha256(artifact.contents),
        actualHash: result?.actualHash || null,
        status: result?.status || "missing",
      };
    }),
    generatedTests,
    coverage: {
      generatedTestCount: generatedTests.length,
      generatedTestArtifacts: generatedTests.map((item) => item.path),
    },
  };
}

function reportMarkdown(manifest, results) {
  const missing = results.filter((item) => item.status === "missing");
  const drifted = results.filter((item) => item.status === "drifted");
  const verified = results.filter((item) => item.status === "ok");
  const lines = [
    "# Axiom Verification Report",
    "",
    `Target: ${manifest.axiom.target}`,
    `Graph hash: ${manifest.axiom.graphHash}`,
    `Generated output: ${manifest.axiom.outDir}`,
    "",
    "## Summary",
    "",
    `- Verified artifacts: ${verified.length}`,
    `- Missing artifacts: ${missing.length}`,
    `- Drifted artifacts: ${drifted.length}`,
    `- Generated test artifacts: ${manifest.coverage.generatedTestCount}`,
    "",
    "## Artifacts",
    "",
  ];

  for (const item of results) {
    lines.push(`- ${item.status.toUpperCase()} ${item.path}`);
  }

  lines.push("");
  lines.push("## Generated Test Coverage");
  lines.push("");
  for (const item of manifest.generatedTests) {
    lines.push(`- ${item.status.toUpperCase()} ${item.path}`);
  }

  return `${lines.join("\n")}\n`;
}

export function formatVerifyReport(report) {
  const lines = [
    "Axiom verification",
    "",
    `App: ${report.graph.app?.name || "unknown"}`,
    `Target: ${report.target}`,
    `Graph hash: ${report.manifest.axiom.graphHash}`,
    "",
    "Artifacts:",
  ];

  for (const item of report.results) {
    lines.push(`${item.status.toUpperCase().padEnd(7, " ")} ${item.path}`);
    if (item.status === "drifted") {
      lines.push(`        expected ${item.expectedHash}`);
      lines.push(`        actual   ${item.actualHash}`);
    }
  }

  lines.push("");
  if (report.ok) {
    lines.push(`Result: verified ${report.verifiedCount} artifact(s).`);
  } else {
    lines.push(`Result: ${report.missingCount} missing, ${report.driftedCount} drifted.`);
  }

  if (report.written.length) {
    lines.push("");
    for (const path of report.written) {
      lines.push(`wrote ${path}`);
    }
  }

  return lines.join("\n");
}

export function verifyExitCode(report) {
  return report.ok ? 0 : 1;
}

export async function verifyGeneratedArtifacts(options = {}) {
  const appPath = resolve(options.appPath);
  const projectDir = dirname(appPath);
  const outDir = options.outDir ? resolve(options.outDir) : join(projectDir, "generated");
  const target = options.target || "typescript";
  const manifestPath = options.manifestPath ? resolve(options.manifestPath) : join(projectDir, "axiom/verification-manifest.json");
  const reportPath = options.reportPath ? resolve(options.reportPath) : join(projectDir, "axiom/verification-report.md");
  const source = await readFile(appPath, "utf8");
  const graph = parseAxiom(source, appPath);
  const diagnostics = validateGraph(graph);

  if (diagnostics.some((item) => item.severity === "error")) {
    throw new Error("Cannot verify generated artifacts from a graph with validation errors.");
  }

  const artifacts = generateArtifacts(graph, diagnostics, { sourcePath: appPath, target });
  const results = [];

  for (const artifact of artifacts) {
    const artifactPath = join(outDir, artifact.path);
    const actual = await readIfExists(artifactPath);
    const expectedHash = sha256(artifact.contents);
    const actualHash = actual === null ? null : sha256(actual);
    let status = "ok";
    if (actual === null) status = "missing";
    else if (actualHash !== expectedHash) status = "drifted";

    results.push({
      path: artifact.path,
      fullPath: artifactPath,
      expectedHash,
      actualHash,
      status,
    });
  }

  const manifest = manifestFor({
    appPath: relative(process.cwd(), appPath) || appPath,
    outDir: relative(process.cwd(), outDir) || outDir,
    target,
    graph,
    artifacts,
    results,
  });
  const missingCount = results.filter((item) => item.status === "missing").length;
  const driftedCount = results.filter((item) => item.status === "drifted").length;
  const verifiedCount = results.filter((item) => item.status === "ok").length;
  const written = [];

  if (options.write) {
    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    written.push(manifestPath);

    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, reportMarkdown(manifest, results), "utf8");
    written.push(reportPath);
  }

  return {
    appPath,
    outDir,
    target,
    graph,
    diagnostics,
    artifacts,
    results,
    manifest,
    missingCount,
    driftedCount,
    verifiedCount,
    ok: missingCount === 0 && driftedCount === 0,
    written,
  };
}
