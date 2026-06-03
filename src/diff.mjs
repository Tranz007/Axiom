function byName(items) {
  return new Map(items.map((item) => [item.name, item]));
}

function sorted(values = []) {
  return [...values].sort();
}

function decisionSignature(capability) {
  return capability.policy.decisions.map((decision) => `${decision.kind} if ${decision.conditions.join(" ")}`);
}

function capabilitySummary(capability) {
  return {
    reads: sorted(capability.reads),
    disclosureModes: sorted(capability.disclosureModes),
    forbiddenDisclosure: sorted(capability.forbiddenDisclosure),
    approval: capability.hasApproval || capability.policy.decisions.some((decision) => decision.kind === "require_approval"),
    approvalBindings: sorted(capability.sections.approval || []),
    decisions: sorted(decisionSignature(capability)),
  };
}

function dataClassSummary(dataClass) {
  return {
    sensitivity: dataClass.sensitivity,
    allowedDisclosure: sorted(dataClass.allowedDisclosure),
    defaultApproval: dataClass.defaultApproval || null,
  };
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function diffSummary(kind, oldItems, newItems, summarize) {
  const oldMap = byName(oldItems);
  const newMap = byName(newItems);
  const added = [];
  const removed = [];
  const changed = [];

  for (const [name, item] of newMap) {
    if (!oldMap.has(name)) {
      added.push({ kind, name });
      continue;
    }

    const before = summarize(oldMap.get(name));
    const after = summarize(item);
    const fields = Object.keys(after).filter((field) => !sameValue(before[field], after[field]));
    if (fields.length) {
      changed.push({ kind, name, fields, before, after });
    }
  }

  for (const name of oldMap.keys()) {
    if (!newMap.has(name)) removed.push({ kind, name });
  }

  return { added, removed, changed };
}

export function diffGraphs(oldGraph, newGraph) {
  const capabilities = diffSummary("capability", oldGraph.capabilities, newGraph.capabilities, capabilitySummary);
  const dataClasses = diffSummary("data_class", oldGraph.dataClasses, newGraph.dataClasses, dataClassSummary);

  return {
    oldApp: oldGraph.app?.name || "unknown",
    newApp: newGraph.app?.name || "unknown",
    added: [...capabilities.added, ...dataClasses.added],
    removed: [...capabilities.removed, ...dataClasses.removed],
    changed: [...capabilities.changed, ...dataClasses.changed],
  };
}

function formatValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "none";
  if (value === true) return "yes";
  if (value === false) return "no";
  return value ?? "none";
}

function formatChangedItem(item) {
  const lines = [`CHANGED ${item.kind} ${item.name}`];
  for (const field of item.fields) {
    lines.push(`      ${field}: ${formatValue(item.before[field])} -> ${formatValue(item.after[field])}`);
  }
  return lines;
}

export function formatGraphDiff(diff) {
  const lines = [`Axiom diff`, `old: ${diff.oldApp}`, `new: ${diff.newApp}`, ""];

  for (const item of diff.added) {
    lines.push(`ADDED ${item.kind} ${item.name}`);
  }
  for (const item of diff.removed) {
    lines.push(`REMOVED ${item.kind} ${item.name}`);
  }
  for (const item of diff.changed) {
    lines.push(...formatChangedItem(item));
  }

  if (!diff.added.length && !diff.removed.length && !diff.changed.length) {
    lines.push("No contract changes.");
  }

  lines.push("");
  lines.push(`Summary: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed.`);
  return lines.join("\n");
}
