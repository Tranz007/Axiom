const SENSITIVE_LEVELS = new Set(["moderate", "high"]);
const HIGH_SENSITIVITY = new Set(["high"]);
const RAW_TERMS = /raw|plaintext|decrypted|secret|credential|token|auth_header|full_profile/i;

function diagnostic(severity, message, ref) {
  return { severity, message, ref };
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
        ),
      );
    }

    if (highReads.length && !capability.sections.broker?.length) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} reads high-sensitivity data but declares no broker boundary.`,
          `capability ${capability.name}`,
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
        ),
      );
    }

    if (highReads.length && capability.auditEvents.length && !auditForbidsRaw(capability)) {
      diagnostics.push(
        diagnostic(
          "error",
          `Capability ${capability.name} audit must explicitly forbid raw or plaintext high-sensitivity values.`,
          `capability ${capability.name}`,
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
