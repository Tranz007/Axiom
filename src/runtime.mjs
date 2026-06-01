export const DECISION_ORDER = ["deny", "require_approval", "allow"];

function normalizeFactValue(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return Boolean(value);
}

function normalizeCondition(condition) {
  return condition.replace(/^(and|or)\s+/, "").trim();
}

function conditionKey(condition) {
  return normalizeCondition(condition)
    .replace(/^not\s+/, "")
    .replace(/\s+/g, "_");
}

function evaluateCondition(condition, facts) {
  const normalized = normalizeCondition(condition);
  const negated = normalized.startsWith("not ");
  const key = conditionKey(normalized);
  const value = normalizeFactValue(facts[key]);
  return negated ? !value : value;
}

function evaluateDecision(decision, facts) {
  if (!decision.conditions.length) {
    return { matched: false, reasons: [] };
  }

  let matched = evaluateCondition(decision.conditions[0], facts);
  const reasons = matched ? [conditionKey(decision.conditions[0])] : [];

  for (const condition of decision.conditions.slice(1)) {
    const operator = condition.startsWith("or ") ? "or" : "and";
    const conditionMatched = evaluateCondition(condition, facts);
    const key = conditionKey(condition);

    if (operator === "and") {
      matched = matched && conditionMatched;
      if (conditionMatched) reasons.push(key);
    } else {
      matched = matched || conditionMatched;
      if (conditionMatched) reasons.push(key);
    }
  }

  return { matched, reasons: [...new Set(reasons)] };
}

export function evaluateAxiomPolicy(graph, capabilityKey, facts = {}) {
  const capability = graph.capabilities.find((item) => item.name === capabilityKey);

  if (!capability) {
    return {
      capability: capabilityKey,
      decision: "deny",
      reasons: ["unknown_capability"],
      matchedRule: null,
      requiredApproval: null,
    };
  }

  for (const decisionKind of DECISION_ORDER) {
    const decisions = capability.policy.decisions.filter((decision) => decision.kind === decisionKind);

    for (const decision of decisions) {
      const result = evaluateDecision(decision, facts);
      if (result.matched) {
        return {
          capability: capability.name,
          decision: decision.kind,
          reasons: result.reasons,
          matchedRule: decision,
          requiredApproval:
            decision.kind === "require_approval"
              ? {
                  capability: capability.name,
                  binds: capability.sections.approval || [],
                }
              : null,
        };
      }
    }
  }

  return {
    capability: capability.name,
    decision: "deny",
    reasons: ["no_policy_rule_matched"],
    matchedRule: null,
    requiredApproval: null,
  };
}

export function parseFactList(values = []) {
  return Object.fromEntries(
    values.map((entry) => {
      const [key, rawValue = "true"] = entry.split("=");
      return [key.trim(), rawValue.trim() === "true" ? true : rawValue.trim() === "false" ? false : rawValue.trim()];
    }),
  );
}
