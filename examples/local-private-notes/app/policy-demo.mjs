import assert from "node:assert/strict";
import { evaluateAxiomPolicy } from "../generated/policy-evaluator.mjs";

const capability = "summarize_private_note";

const scenarios = [
  {
    name: "local summary",
    expected: "allow",
    facts: {
      owner_authenticated: true,
      note_selected: true,
      destination_local: true,
    },
  },
  {
    name: "external destination",
    expected: "require_approval",
    facts: {
      destination_external: true,
    },
  },
  {
    name: "raw note request",
    expected: "deny",
    facts: {
      owner_authenticated: true,
      note_selected: true,
      destination_local: true,
      requests_raw_note: true,
    },
  },
];

const results = scenarios.map((scenario) => {
  const result = evaluateAxiomPolicy(capability, scenario.facts);
  assert.equal(result.decision, scenario.expected);
  return {
    scenario: scenario.name,
    decision: result.decision,
    reasons: result.reasons,
  };
});

console.log(JSON.stringify(results, null, 2));
