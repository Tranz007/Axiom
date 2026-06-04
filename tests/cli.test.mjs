import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const cli = new URL("../bin/axiom.mjs", import.meta.url).pathname;

function childProcessEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

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

function axiomWithInput(args, input, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: new URL("..", import.meta.url).pathname,
      env: childProcessEnv(),
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else reject(Object.assign(new Error(`Command failed with exit code ${code}`), { stdout, stderr, code }));
    });
    child.stdin.end(input);
  });
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

  it("prints beginner guidance for sensitive-data validation errors", async () => {
    await expectAxiomFailure(
      ["validate", "tests/fixtures/bad/missing-approval-binding.ax"],
      /missing: approval path[\s\S]*why it matters:[\s\S]*try:/,
    );
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
      const nodeEvaluator = await readFile(join(dir, "policy-evaluator.mjs"), "utf8");
      const report = await readFile(join(dir, "axiom-report.md"), "utf8");
      assert.match(capabilities, /fill_tax_identity_fields/);
      assert.match(evaluator, /evaluateAxiomPolicy/);
      assert.match(nodeEvaluator, /export function evaluateAxiomPolicy/);
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
      assert.match(instructions, /token-aware/);
      assert.match(instructions, /external model/);
      assert.match(simulations, /local-private-app/);
      assert.match(simulations, /summarize_private_document/);

      const validation = await axiom(["validate", join(dir, "app.ax")]);
      assert.match(validation.stdout, /0 errors/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("initializes a starter project through guided init", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-guided-init-"));
    try {
      const result = await axiomWithInput(["init", "--guided", "--out", dir], "2\n4\n");
      assert.match(result.stdout, /Axiom guided init/);
      assert.match(result.stdout, /initialized agent-gateway for generic/);

      const app = await readFile(join(dir, "app.ax"), "utf8");
      const instructions = await readFile(join(dir, "instructions.md"), "utf8");
      const simulations = await readFile(join(dir, "axiom", "simulations.json"), "utf8");

      assert.match(app, /app AgentGateway/);
      assert.match(instructions, /Axiom Agent Instructions/);
      assert.match(simulations, /agent-gateway/);
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

  it("generates runnable tests from simulation examples", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-generated-tests-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      const result = await axiom([
        "generate-tests",
        join(dir, "app.ax"),
        "--examples",
        join(dir, "axiom", "simulations.json"),
        "--target",
        "node",
        "--out",
        join(dir, "generated-tests"),
      ]);

      assert.match(result.stdout, /generated .*axiom-policy\.test\.mjs/);

      const testFile = join(dir, "generated-tests", "axiom-policy.test.mjs");
      const contents = await readFile(testFile, "utf8");
      assert.match(contents, /Axiom policy simulation examples/);
      assert.match(contents, /Local summary allow path/);
      assert.match(contents, /External destination requires approval/);

      const generatedTest = await run(process.execPath, ["--test", testFile], {
        cwd: dir,
        env: childProcessEnv(),
      });
      assert.match(`${generatedTest.stdout}\n${generatedTest.stderr}`, /pass 2/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("recommends generated policy tests after artifacts exist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-next-tests-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      await axiom(["simulate-examples", "--cwd", dir]);
      await axiom(["generate", join(dir, "app.ax"), "--target", "typescript", "--out", join(dir, "generated")]);

      const next = await axiom(["next", "--cwd", dir]);
      assert.match(next.stdout, /Next: axiom generate-tests .*app\.ax --examples axiom\/simulations\.json --out generated-tests/);
      assert.match(next.stdout, /without loading the whole contract into context/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("recommends running generated policy tests when present", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-next-run-tests-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      await axiom(["simulate-examples", "--cwd", dir]);
      await axiom(["generate", join(dir, "app.ax"), "--target", "typescript", "--out", join(dir, "generated")]);
      await axiom([
        "generate-tests",
        join(dir, "app.ax"),
        "--examples",
        join(dir, "axiom", "simulations.json"),
        "--out",
        join(dir, "generated-tests"),
      ]);

      const next = await axiom(["next", "--cwd", dir]);
      assert.match(next.stdout, /Next: node --test generated-tests\/axiom-policy\.test\.mjs/);
      assert.match(next.stdout, /compact policy test/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("recommends regeneration when app.ax is newer than generated artifacts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-next-stale-"));
    try {
      const appPath = join(dir, "app.ax");
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);
      await axiom(["simulate-examples", "--cwd", dir]);
      await axiom(["generate", appPath, "--target", "typescript", "--out", join(dir, "generated")]);
      const future = new Date(Date.now() + 5000);
      await utimes(appPath, future, future);

      const next = await axiom(["next", "--cwd", dir]);
      assert.match(next.stdout, /Next: axiom generate .*app\.ax --target typescript --out generated/);
      assert.match(next.stdout, /app\.ax changed after generated artifacts/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("runs the first agent loop from a fresh project", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-first-loop-"));
    try {
      await axiom(["init", "--template", "local-private-app", "--agent", "codex", "--out", dir]);

      const firstNext = await axiom(["next", "--cwd", dir]);
      assert.match(firstNext.stdout, /Next: Run one command from axiom\/simulations\.json/);

      await axiom(["simulate-examples", "--cwd", dir]);
      const generationNext = await axiom(["next", "--cwd", dir]);
      assert.match(generationNext.stdout, /Next: axiom generate .*app\.ax --target typescript --out generated/);

      await axiom(["generate", join(dir, "app.ax"), "--target", "typescript", "--out", join(dir, "generated")]);
      const testGenerationNext = await axiom(["next", "--cwd", dir]);
      assert.match(testGenerationNext.stdout, /Next: axiom generate-tests .*app\.ax --examples axiom\/simulations\.json --out generated-tests/);

      await axiom([
        "generate-tests",
        join(dir, "app.ax"),
        "--examples",
        join(dir, "axiom", "simulations.json"),
        "--out",
        join(dir, "generated-tests"),
      ]);
      const runTestsNext = await axiom(["next", "--cwd", dir]);
      assert.match(runTestsNext.stdout, /Next: node --test generated-tests\/axiom-policy\.test\.mjs/);

      const generatedTest = await run(process.execPath, ["--test", join(dir, "generated-tests", "axiom-policy.test.mjs")], {
        cwd: dir,
        env: childProcessEnv(),
      });
      assert.match(`${generatedTest.stdout}\n${generatedTest.stderr}`, /pass 2/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("runs the local private notes example app", async () => {
    const validation = await axiom(["validate", "examples/local-private-notes/axiom.ax"]);
    assert.match(validation.stdout, /0 errors/);

    const result = await run(process.execPath, ["examples/local-private-notes/app/policy-demo.mjs"], {
      cwd: new URL("..", import.meta.url).pathname,
      env: childProcessEnv(),
    });
    const decisions = JSON.parse(result.stdout);
    assert.deepEqual(
      decisions.map((item) => item.decision),
      ["allow", "require_approval", "deny"],
    );
  });

  it("diffs Axiom contract changes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "axiom-diff-"));
    try {
      const oldFile = join(dir, "old.ax");
      const newFile = join(dir, "new.ax");
      await writeFile(
        oldFile,
        `app DiffOld
  intent:
    compare contracts

data_class private.note
  domain personal
  sensitivity high
  allowed_disclosure:
    summary

capability summarize_private_note
  purpose:
    summarize one note
  data:
    requires private.note
  disclosure:
    mode summary
  policy:
    allow if owner_authenticated
    deny if requests_raw_note
  audit:
    record invocation
    never log raw_note

capability archive_note
  purpose:
    archive one note
  policy:
    allow if owner_authenticated
    deny if ownership_scope_invalid
`,
        "utf8",
      );
      await writeFile(
        newFile,
        `app DiffNew
  intent:
    compare contracts

data_class private.note
  domain personal
  sensitivity high
  allowed_disclosure:
    summary
    task_fields

data_class private.tag
  domain personal
  sensitivity moderate
  allowed_disclosure:
    label

capability summarize_private_note
  purpose:
    summarize one note
  data:
    requires private.note
    requires private.tag
  disclosure:
    mode summary | task_fields
  policy:
    allow if owner_authenticated
    require_approval if destination_external
    deny if requests_raw_note
  approval:
    one_time_default
    binds request_hash, owner_id, capability_key, expiry
  audit:
    record invocation
    never log raw_note

capability share_note_summary
  purpose:
    share a summary
  data:
    requires private.note
  disclosure:
    mode summary
  policy:
    allow if owner_authenticated
    deny if requests_raw_note
`,
        "utf8",
      );

      const result = await axiom(["diff", oldFile, newFile]);
      assert.match(result.stdout, /Axiom diff/);
      assert.match(result.stdout, /old: DiffOld/);
      assert.match(result.stdout, /new: DiffNew/);
      assert.match(result.stdout, /ADDED data_class private\.tag/);
      assert.match(result.stdout, /ADDED capability share_note_summary/);
      assert.match(result.stdout, /REMOVED capability archive_note/);
      assert.match(result.stdout, /CHANGED capability summarize_private_note/);
      assert.match(result.stdout, /reads: private\.note -> private\.note, private\.tag/);
      assert.match(result.stdout, /approval: no -> yes/);
      assert.match(result.stdout, /CHANGED data_class private\.note/);
      assert.match(result.stdout, /allowedDisclosure: summary -> summary, task_fields/);
      assert.match(result.stdout, /Summary: 2 added, 1 removed, 2 changed/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("reports no diff for unchanged Axiom contracts", async () => {
    const result = await axiom([
      "diff",
      "examples/local-private-notes/axiom.ax",
      "examples/local-private-notes/axiom.ax",
    ]);
    assert.match(result.stdout, /No contract changes/);
    assert.match(result.stdout, /Summary: 0 added, 0 removed, 0 changed/);
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
