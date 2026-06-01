import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const cli = new URL("../bin/axiom.mjs", import.meta.url).pathname;

async function axiom(args, options = {}) {
  return run(process.execPath, [cli, ...args], {
    cwd: new URL("..", import.meta.url).pathname,
    ...options,
  });
}

async function expectAxiomFailure(args, pattern) {
  try {
    await axiom(args);
    assert.fail("Expected Axiom command to fail");
  } catch (error) {
    assert.match(`${error.stdout}\n${error.stderr}\n${error.message}`, pattern);
  }
}

describe("axiom cli", () => {
  it("validates good examples", async () => {
    const result = await axiom(["validate", "tests/fixtures/good/agent-capability-gateway.ax"]);
    assert.match(result.stdout, /0 errors/);
  });

  it("fails unsafe raw sensitive export", async () => {
    await expectAxiomFailure(["validate", "tests/fixtures/bad/raw-sensitive-export.ax"], /approval path|broker boundary|raw or plaintext/);
  });

  it("fails missing approval path", async () => {
    await expectAxiomFailure(["validate", "tests/fixtures/bad/missing-approval-binding.ax"], /approval path/);
  });

  it("fails model-decided policy", async () => {
    await expectAxiomFailure(["validate", "tests/fixtures/bad/model-decides-policy.ax"], /cannot delegate access decisions/);
  });

  it("generates TypeScript artifacts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-test-"));
    try {
      await axiom([
        "generate",
        "tests/fixtures/good/agent-capability-gateway.ax",
        "--target",
        "typescript",
        "--out",
        dir,
      ]);
      const capabilities = await readFile(join(dir, "capabilities.ts"), "utf8");
      const report = await readFile(join(dir, "axiom-report.md"), "utf8");
      assert.match(capabilities, /fill_tax_identity_fields/);
      assert.match(report, /Axiom Verification Report/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
