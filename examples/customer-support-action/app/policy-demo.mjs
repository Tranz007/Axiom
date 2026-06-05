import { evaluateAxiomPolicy } from "../generated/policy-evaluator.mjs";

const scenarios = [
  {
    name: "assigned support reply",
    result: evaluateAxiomPolicy("draft_customer_reply", {
      agent_assigned_to_ticket: true,
      customer_matches_ticket: true,
      reply_goal_in_scope: true,
    }),
  },
  {
    name: "refund needs approval",
    result: evaluateAxiomPolicy("issue_refund_credit", {
      refund_requested: true,
    }),
  },
  {
    name: "raw customer export denied",
    result: evaluateAxiomPolicy("draft_customer_reply", {
      agent_assigned_to_ticket: true,
      customer_matches_ticket: true,
      reply_goal_in_scope: true,
      requests_full_customer_profile: true,
    }),
  },
];

console.log(
  JSON.stringify(
    scenarios.map((scenario) => ({
      name: scenario.name,
      decision: scenario.result.decision,
      capability: scenario.result.capability,
      matchedRule: scenario.result.matchedRule,
    })),
    null,
    2,
  ),
);
