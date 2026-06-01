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
      const evaluator = await readFile(join(dir, "policy-evaluator.ts"), "utf8");
      const report = await readFile(join(dir, "axiom-report.md"), "utf8");
      assert.match(capabilities, /fill_tax_identity_fields/);
      assert.match(evaluator, /evaluateAxiomPolicy/);
      assert.match(report, /Axiom Verification Report/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("initializes a starter Axiom project", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-init-"));
    try {
      const result = await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      assert.match(result.stdout, /initialized local-private-app for codex/);

      const app = await readFile(join(dir, "app.ax"), "utf8");
      const instructions = await readFile(join(dir, "AGENTS.md"), "utf8");
      const simulations = await readFile(join(dir, "axiom", "simulations.json"), "utf8");

      assert.match(app, /app LocalPrivateApp/);
      assert.match(instructions, /Axiom Project Instructions/);
      assert.match(simulations, /local-private-app/);
      assert.match(simulations, /summarize_private_document/);

      const validation = await axiom(["validate", join(dir, "app.ax")]);
      assert.match(validation.stdout, /0 errors/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("ships valid app init templates", async () => {
    const result = await axiom(["init", "--list"]);
    const templates = JSON.parse(result.stdout).apps;

    for (const template of templates) {
      const dir = await mkdtemp(join(tmpdir(), `axiom-${template}-`));
      try {
        await axiom(["init", "--template", template, "--agent", "generic", "--out", dir]);
        const validation = await axiom(["validate", join(dir, "app.ax")]);
        assert.match(validation.stdout, /0 errors/);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  });

  it("reports project health for initialized projects", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-doctor-"));
    try {
      await axiom(["init", "--template", "agent-gateway", "--agent", "codex", "--out", dir]);
      const result = await axiom(["doctor", "--cwd", dir]);

      assert.match(result.stdout, /Axiom project health/);
      assert.match(result.stdout, /OK\s+app\.ax found/);
      assert.match(result.stdout, /OK\s+agent instructions found/);
      assert.match(result.stdout, /OK\s+simulation hints found/);
      assert.match(result.stdout, /INFO\s+generated artifacts not found/);
      assert.match(result.stdout, /Result: ready|Result: usable/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("explains missing project setup", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-empty-"));
    try {
      await expectAxiomFailure(["doctor", "--cwd", dir], /app\.ax missing|axiom init --template local-private-app/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("recommends init as the next action for empty projects", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-next-empty-"));
    try {
      const result = await axiom(["next", "--cwd", dir]);

      assert.match(result.stdout, /Axiom next action/);
      assert.match(result.stdout, /Next: axiom init --template local-private-app --agent codex/);
      assert.match(result.stdout, /No Axiom contract was found/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("recommends simulation as the next action for initialized projects", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-next-ready-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      const result = await axiom(["next", "--cwd", dir]);

      assert.match(result.stdout, /Axiom next action/);
      assert.match(result.stdout, /Next: Run one command from axiom\/simulations\.json/);
      assert.match(result.stdout, /test at least one policy path/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("runs simulation examples before recommending generation", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-sim-examples-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      const simulation = await axiom(["simulate-examples", "--cwd", dir]);
      assert.match(simulation.stdout, /Axiom simulation examples/);
      assert.match(simulation.stdout, /ALLOW Local summary allow path/);
      assert.match(simulation.stdout, /REQUIRE_APPROVAL External destination requires approval/);

      const results = await readFile(join(dir, "axiom", "simulation-results.json"), "utf8");
      assert.match(results, /summarize_private_document/);

      const next = await axiom(["next", "--cwd", dir]);
      assert.match(next.stdout, /Next: axiom generate .*app\.ax --target typescript --out generated/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("simulates an allow decision", async () => {
    const result = await axiom([
      "simulate",
      "tests/fixtures/good/agent-capability-gateway.ax",
      "--capability",
      "use_approved_address",
      "--fact",
      "agent_has_capability=true",
      "--fact",
      "destination_allowlisted_for_capability=true",
      "--fact",
      "request_frequency_normal=true",
    ]);

    assert.match(result.stdout, /"decision": "allow"/);
  });

  it("simulates a require_approval decision", async () => {
    const result = await axiom([
      "simulate",
      "tests/fixtures/good/agent-capability-gateway.ax",
      "--capability",
      "fill_tax_identity_fields",
      "--fact",
      "standing_policy_absent=true",
    ]);

    assert.match(result.stdout, /"decision": "require_approval"/);
    assert.match(result.stdout, /"requiredApproval"/);
  });

  it("gives deny precedence during simulation", async () => {
    await expectAxiomFailure(
      [
        "simulate",
        "tests/fixtures/good/agent-capability-gateway.ax",
        "--capability",
        "fill_tax_identity_fields",
        "--fact",
        "agent_has_capability=true",
        "--fact",
        "destination_allowlisted_for_capability=true",
        "--fact",
        "standing_policy_matches=true",
        "--fact",
        "required_fields_subset_of_capability=true",
        "--fact",
        "destination_blocked=true",
      ],
      /"decision": "deny"/,
    );
  });
});
