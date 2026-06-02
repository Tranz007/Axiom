const SENSITIVE_LEVELS = new Set(["moderate", "high"]);
const HIGH_SENSITIVITY = new Set(["high"]);
const RAW_TERMS = /raw|plaintext|decrypted|secret|credential|token|auth_header|full_profile/i;

function diagnostic(severity, message, ref, guidance = {}) {
  return { severity, message, ref, ...guidance };
}

function byName(items) {
  return new Map(items.map((item) => [item.name, item]));
}

function dataRefName(ref) {
  return ref.split(/\s+/)[0];
}

function isSensitive(dataClass) {
  return dataClass && SENSITIVE_LEVELS.has(dataClass.sensitivity);
}

function isHigh(dataClass) {
  return dataClass && HIGH_SENSITIVITY.has(dataClass.sensitivity);
}

function hasDecision(capability, kind) {
  return capability.policy.decisions.some((decision) => decision.kind === kind);
}

function auditForbidsRaw(capability) {
  return capability.auditEvents.some((line) => /^never\s+log\s+/.test(line) && RAW_TERMS.test(line));
}

export function validateGraph(graph) {
  const diagnostics = [];
  const dataClasses = byName(graph.dataClasses);

  if (!graph.app) {
    diagnostics.push(diagnostic("error", "Program must declare an app.", "app"));
  }

  if (graph.capabilities.length === 0) {
    diagnostics.push(diagnostic("error", "Program must declare at least one capability.", "capability"));
  }

  for (const dataClass of graph.dataClasses) {
    if (isSensitive(dataClass) && dataClass.allowedDisclosure.length === 0) {
      diagnostics.push(
        diagnostic(
          "error",
          `Sensitive data class ${dataClass.name} must declare allowed_disclosure.`,
          `data_class ${dataClass.name}`,
          {
            missing: ["allowed_disclosure"],
            why: "Axiom needs to know what form of this data is safe to return before an agent or app code can use it.",
            try: ["Add allowed_disclosure values such as task_fields, masked_value, or tokenized_reference."],
          },
        ),
      );
    }
  }

  for (const actor of graph.actors) {
    const untrusted = /untrusted|external/i.test(actor.trust);
    if (untrusted && actor.mayNot.length === 0) {
      diagnostics.push(
        diagnostic(
          "warning",
          `Untrusted actor ${actor.name} should declare may_not restrictions.`,
          `actor ${actor.name}`,
        ),
      );
    }

    if (actor.mayNot.some((item) => /decide policy|policy/i.test(item)) === false && untrusted) {
      diagnostics.push(
        diagnostic(
          "warning",
          `Untrusted actor ${actor.name} should explicitly be forbidden from deciding policy.`,
          `actor ${actor.name}`,
        ),
      );
    }
  }

  for (const capability of graph.capabilities) {
    if (!capability.sections.purpose?.length) {
      diagnostics.push(
        diagnostic("error", `Capability ${capability.name} must declare purpose.`, `capability ${capability.name}`),
      );
    }

    if (!capability.sections.policy?.length) {
      diagnostics.push(
        diagnostic("error", `Capability ${capability.name} must declare policy.`, `capability ${capability.name}`),
      );
    } else {
      for (const kind of ["allow", "deny"]) {
        if (!hasDecision(capability, kind)) {
          diagnostics.push(
            diagnostic(
              "error",
              `Capability ${capability.name} policy must include a ${kind} decision.`,
              `capability ${capability.name}`,
            ),
          );
        }
      }
    }

    const readClasses = capability.reads.map(dataRefName).map((name) => dataClasses.get(name)).filter(Boolean);
    const sensitiveReads = readClasses.filter(isSensitive);
    const highReads = readClasses.filter(isHigh);

    if (sensitiveReads.length && capability.disclosureModes.length === 0) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} reads sensitive data but declares no disclosure mode.`,
          `capability ${capability.name}`,
          {
            missing: ["disclosure mode"],
            why: "This capability reads private or sensitive data, but the contract does not say what shape is allowed to leave the trusted boundary.",
            try: ["Add a disclosure block with a narrow mode, such as task_fields or masked_value."],
          },
        ),
      );
    }

    if (sensitiveReads.length && capability.forbiddenDisclosure.length === 0) {
      diagnostics.push(
        diagnostic(
          "warning",
          `Capability ${capability.name} reads sensitive data but declares no forbidden disclosure values.`,
          `capability ${capability.name}`,
        ),
      );
    }

    if (highReads.length && !hasDecision(capability, "require_approval") && !capability.hasApproval) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} reads high-sensitivity data but has no approval path.`,
          `capability ${capability.name}`,
          {
            missing: ["approval path"],
            why: "High-sensitivity data should not be available to agent-driven code without a deterministic policy gate or human approval path.",
            try: [
              "Add a require_approval policy decision for risky cases.",
              "Or add an approval block that binds request_hash, owner_id, capability_key, and expiry.",
            ],
          },
        ),
      );
    }

    if (highReads.length && !capability.sections.broker?.length) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} reads high-sensitivity data but declares no broker boundary.`,
          `capability ${capability.name}`,
          {
            missing: ["broker boundary"],
            why: "A broker is the trusted code boundary that can touch sensitive data while returning only the approved result shape.",
            try: ["Add a broker block that names what it may decrypt and what it may return."],
          },
        ),
      );
    }

    if (sensitiveReads.length && !highReads.length && !capability.sections.broker?.length) {
      diagnostics.push(
        diagnostic(
          "warning",
          `Capability ${capability.name} reads sensitive data without an explicit broker boundary.`,
          `capability ${capability.name}`,
        ),
      );
    }

    if (sensitiveReads.length && !capability.auditEvents.length) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} reads sensitive data but declares no audit obligations.`,
          `capability ${capability.name}`,
          {
            missing: ["audit obligations"],
            why: "Sensitive operations need a durable trail so a human can inspect what happened later.",
            try: ["Add an audit block with record events and a rule that forbids logging raw sensitive values."],
          },
        ),
      );
    }

    if (highReads.length && capability.auditEvents.length && !auditForbidsRaw(capability)) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} audit must explicitly forbid raw or plaintext high-sensitivity values.`,
          `capability ${capability.name}`,
          {
            missing: ["raw-value audit guard"],
            why: "Audit logs are long-lived. They should prove the action happened without storing secrets, credentials, or full private records.",
            try: ["Add an audit line such as `never log raw_secret`, `never log plaintext`, or the raw field name used by this capability."],
          },
        ),
      );
    }

    if (sensitiveReads.length && !highReads.length && capability.auditEvents.length && !auditForbidsRaw(capability)) {
      diagnostics.push(
        diagnostic(
          "warning",
          `Capability ${capability.name} audit should explicitly forbid raw or plaintext sensitive values.`,
          `capability ${capability.name}`,
        ),
      );
    }

    if (capability.policy.decisions.some((decision) => /model decides|llm decides/i.test(decision.conditions.join(" ")))) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} policy cannot delegate access decisions to a model.`,
          `capability ${capability.name}`,
          {
            why: "The model can request a capability, but policy must be checked by deterministic code.",
            try: ["Replace model-decided conditions with explicit facts such as user_authenticated, destination_allowlisted, or approval_valid."],
          },
        ),
      );
    }
  }

  const hasUntrustedActor = graph.actors.some((actor) => /untrusted|external/i.test(actor.trust));
  const forbidsModelDecidedPolicy = graph.invariants.some((invariant) =>
    invariant.forbid.some((item) => /model decides policy/i.test(item)),
  );

  if (hasUntrustedActor && !forbidsModelDecidedPolicy) {
    diagnostics.push(
      diagnostic(
        "warning",
        "Programs with external or untrusted actors should include an invariant forbidding model-decided policy.",
        "invariant",
      ),
    );
  }

  return diagnostics;
}
