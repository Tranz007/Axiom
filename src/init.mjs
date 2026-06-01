import { access, copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const TEMPLATE_ROOT = new URL("../templates/", import.meta.url);

const AGENT_TEMPLATES = {
  codex: { source: "agents/AGENTS.md", destination: "AGENTS.md" },
  claude: { source: "agents/CLAUDE.md", destination: "CLAUDE.md" },
  cursor: { source: "agents/cursor-rules.md", destination: ".cursor/rules/axiom.md" },
  generic: { source: "agents/instructions.md", destination: "instructions.md" },
};

const DEFAULT_TEMPLATE = "local-private-app";
const DEFAULT_AGENT = "codex";

const SIMULATION_EXAMPLES = {
  "local-private-app": [
    {
      description: "Local summary allow path.",
      command:
        "axiom simulate app.ax --capability summarize_private_document --fact owner_authenticated=true --fact document_selected=true --fact destination_local=true",
    },
    {
      description: "External destination requires approval.",
      command: "axiom simulate app.ax --capability summarize_private_document --fact destination_external=true",
    },
  ],
  "agent-gateway": [
    {
      description: "Allow approved agent workflow.",
      command:
        "axiom simulate app.ax --capability use_contact_for_workflow --fact agent_has_capability=true --fact destination_allowlisted_for_capability=true --fact request_frequency_normal=true",
    },
    {
      description: "Unknown destination requires approval.",
      command: "axiom simulate app.ax --capability use_contact_for_workflow --fact destination_unknown=true",
    },
  ],
  "sensitive-upload-app": [
    {
      description: "Allow assigned worker processing.",
      command:
        "axiom simulate app.ax --capability process_uploaded_file --fact user_authenticated=true --fact worker_assigned_to_upload=true --fact processing_goal_in_scope=true",
    },
    {
      description: "External processor requires approval.",
      command: "axiom simulate app.ax --capability process_uploaded_file --fact external_processor_requested=true",
    },
  ],
  "approval-gated-automation": [
    {
      description: "Allow approved external action.",
      command:
        "axiom simulate app.ax --capability draft_and_submit_action --fact user_authenticated=true --fact approval_valid=true --fact destination_matches_approval=true",
    },
    {
      description: "External effect requires approval.",
      command: "axiom simulate app.ax --capability draft_and_submit_action --fact external_effect_requested=true",
    },
  ],
};

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizeTemplateName(name) {
  return name.endsWith(".ax") ? basename(name, ".ax") : name;
}

function templatePath(relativePath) {
  return new URL(relativePath, TEMPLATE_ROOT);
}

async function copyTemplate({ source, destination, force }) {
  if (!force && (await exists(destination))) {
    throw new Error(`${destination} already exists. Use --force to overwrite it.`);
  }

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  return destination;
}

async function writeJson({ destination, value, force }) {
  if (!force && (await exists(destination))) {
    throw new Error(`${destination} already exists. Use --force to overwrite it.`);
  }

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return destination;
}

export async function listInitTemplates() {
  const appFiles = await readdir(templatePath("apps/"));
  return {
    agents: Object.keys(AGENT_TEMPLATES),
    apps: appFiles.filter((file) => file.endsWith(".ax")).map((file) => basename(file, ".ax")),
  };
}

export async function initProject(options = {}) {
  const outDir = resolve(options.outDir || ".");
  const force = Boolean(options.force);
  const agent = options.agent || DEFAULT_AGENT;
  const template = normalizeTemplateName(options.template || DEFAULT_TEMPLATE);
  const agentTemplate = AGENT_TEMPLATES[agent];

  if (!agentTemplate) {
    const available = Object.keys(AGENT_TEMPLATES).join(", ");
    throw new Error(`Unknown agent "${agent}". Available agents: ${available}`);
  }

  const appSource = templatePath(`apps/${template}.ax`);
  if (!(await exists(appSource))) {
    const available = (await listInitTemplates()).apps.join(", ");
    throw new Error(`Unknown app template "${template}". Available templates: ${available}`);
  }

  await mkdir(outDir, { recursive: true });

  const written = [];
  written.push(
    await copyTemplate({
      source: appSource,
      destination: join(outDir, "app.ax"),
      force,
    }),
  );
  written.push(
    await copyTemplate({
      source: templatePath(agentTemplate.source),
      destination: join(outDir, agentTemplate.destination),
      force,
    }),
  );
  written.push(
    await writeJson({
      destination: join(outDir, "axiom", "simulations.json"),
      value: {
        template,
        examples: SIMULATION_EXAMPLES[template] || [],
      },
      force,
    }),
  );

  return { outDir, agent, template, written };
}
