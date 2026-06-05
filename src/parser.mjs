const TOP_LEVEL = /^(app|actor|data_class|capability|invariant|target)\s+(.+)$/;
const SECTION = /^  ([A-Za-z_][\w.-]*):\s*(.*)$/;
const INLINE = /^  ([A-Za-z_][\w.-]*)\s+(.+)$/;
const ITEM = /^    (.+)$/;

function emptyGraph(sourcePath) {
  return {
    sourcePath,
    app: null,
    actors: [],
    dataClasses: [],
    capabilities: [],
    invariants: [],
    targets: [],
    topLevel: [],
  };
}

function emptyFields() {
  return Object.create(null);
}

function pushSectionValue(node, section, value) {
  if (!node.sections[section]) node.sections[section] = [];
  if (value) node.sections[section].push(value.trim());
}

function parsePolicy(lines) {
  const decisions = [];
  let current = null;

  for (const line of lines) {
    const match = /^(allow|deny|require_approval)\s+if\s+(.+)$/.exec(line);
    if (match) {
      current = { kind: match[1], conditions: [match[2].trim()] };
      decisions.push(current);
      continue;
    }

    if (current && /^(and|or)\s+/.test(line)) {
      current.conditions.push(line.trim());
    }
  }

  return { decisions };
}

function extractRequires(lines) {
  return lines
    .map((line) => /^requires\s+(.+)$/.exec(line)?.[1])
    .filter(Boolean)
    .map((value) => value.trim());
}

function extractDisclosureModes(lines) {
  return lines
    .map((line) => /^mode\s+(.+)$/.exec(line)?.[1])
    .filter(Boolean)
    .flatMap((value) => value.split("|"))
    .map((value) => value.trim())
    .filter(Boolean);
}

function extractForbidden(lines) {
  return lines
    .map((line) => /^forbidden\s+(.+)$/.exec(line)?.[1])
    .filter(Boolean)
    .map((value) => value.trim());
}

function normalizeNode(node) {
  if (node.kind === "capability") {
    node.policy = parsePolicy(node.sections.policy || []);
    node.reads = extractRequires(node.sections.data || []);
    node.disclosureModes = extractDisclosureModes(node.sections.disclosure || []);
    node.forbiddenDisclosure = extractForbidden(node.sections.disclosure || []);
    node.auditEvents = node.sections.audit || [];
    node.hasApproval = Boolean(node.sections.approval?.length);
  }

  if (node.kind === "data_class") {
    node.sensitivity = node.inline.sensitivity || "unspecified";
    node.allowedDisclosure = node.sections.allowed_disclosure || [];
    node.defaultApproval = node.inline.default_approval || null;
  }

  if (node.kind === "actor") {
    node.trust = node.inline.trust || node.sections.trust?.[0] || "unspecified";
    node.may = node.sections.may || [];
    node.mayNot = node.sections.may_not || [];
  }

  if (node.kind === "invariant") {
    node.forbid = node.sections.forbid || [];
    node.require = node.sections.require || [];
  }

  return node;
}

export function parseAxiom(source, sourcePath = "<memory>") {
  const graph = emptyGraph(sourcePath);
  let current = null;
  let currentSection = null;

  const lines = source.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((rawLine, index) => {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) return;

    const topLevel = TOP_LEVEL.exec(line);
    if (topLevel) {
      current = {
        kind: topLevel[1],
        name: topLevel[2].trim(),
        sections: emptyFields(),
        inline: emptyFields(),
        loc: { line: index + 1 },
      };
      currentSection = null;
      graph.topLevel.push(current);
      return;
    }

    if (!current) return;

    const section = SECTION.exec(line);
    if (section) {
      currentSection = section[1];
      pushSectionValue(current, currentSection, section[2]);
      return;
    }

    const inline = INLINE.exec(line);
    if (inline) {
      current.inline[inline[1]] = inline[2].trim();
      return;
    }

    const item = ITEM.exec(line);
    if (item && currentSection) {
      pushSectionValue(current, currentSection, item[1]);
    }
  });

  for (const node of graph.topLevel.map(normalizeNode)) {
    if (node.kind === "app") graph.app = node;
    if (node.kind === "actor") graph.actors.push(node);
    if (node.kind === "data_class") graph.dataClasses.push(node);
    if (node.kind === "capability") graph.capabilities.push(node);
    if (node.kind === "invariant") graph.invariants.push(node);
    if (node.kind === "target") graph.targets.push(node);
  }

  return graph;
}
