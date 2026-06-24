import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Posture = {
  id: string;
  label: string;
  description: string;
  triggers: string[];
  axes: Record<string, string>;
  rules: string[];
};

type Catalog = {
  version: number;
  postures: Posture[];
  risk_patterns: {
    high_risk_paths: string[];
    destructive_words: string[];
  };
};

type PostureResult = {
  id: string;
  label: string;
  description: string;
  score: number;
  reason: string;
  warnings: string[];
  axes: Record<string, string>;
  rules: string[];
  agent: string;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, "..", "coding_posture_engine", "postures.json");
const CATALOG = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as Catalog;

const CODING_SIGNALS = [
  "code", "repo", "git", "test", "pytest", "npm", "build", "ci", "bug", "fix",
  "diff", "pr", "pull request", "refactor", "function", "class", "api", "deploy",
  "python", "typescript", "javascript", "go", "docker", "kubernetes", "terraform",
  "security", "auth", "token", "migration", "database", "schema"
];

function tokenize(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-zA-Z0-9_-]+/g) ?? []));
}

function matchesSignal(text: string, tokens: Set<string>, signal: string): boolean {
  const s = signal.toLowerCase();
  return s.includes(" ") ? text.includes(s) : tokens.has(s);
}

function looksCodingRelated(text: string): boolean {
  const t = text.toLowerCase();
  const tokens = tokenize(t);
  return CODING_SIGNALS.some((s) => matchesSignal(t, tokens, s));
}

function riskBonus(text: string, tokens: Set<string>, id: string): number {
  const highRisk = CATALOG.risk_patterns.high_risk_paths.some((p) => matchesSignal(text, tokens, p));
  const destructive = CATALOG.risk_patterns.destructive_words.some((w) => matchesSignal(text, tokens, w));
  if ((highRisk || destructive) && (id === "entropy-auditor" || id === "cautious-migrator")) return 3;
  if (destructive && id === "surgical-fixer") return -1;
  return 0;
}

function warnings(text: string, tokens: Set<string>, id: string): string[] {
  const out: string[] = [];
  if (CATALOG.risk_patterns.high_risk_paths.some((p) => matchesSignal(text, tokens, p))) {
    out.push("high-risk path/domain detected; keep risk tolerance low");
  }
  if (CATALOG.risk_patterns.destructive_words.some((w) => matchesSignal(text, tokens, w))) {
    out.push("destructive wording detected; require explicit scope and rollback");
  }
  if (id === "prototype-goblin" && out.length > 0) {
    out.push("prototype posture must stay isolated from production paths");
  }
  return out;
}

function selectPosture(prompt: string, agent = "pi", previousPosture?: string): PostureResult {
  const text = prompt.toLowerCase();
  const tokens = tokenize(prompt);
  let best = { score: Number.NEGATIVE_INFINITY, posture: CATALOG.postures[0], hits: [] as string[] };

  for (const posture of CATALOG.postures) {
    let score = 0;
    const hits: string[] = [];
    for (const trigger of posture.triggers) {
      if (matchesSignal(text, tokens, trigger)) {
        score += trigger.includes(" ") ? 2 : 1.2;
        hits.push(trigger);
      }
    }
    if (previousPosture && posture.id === previousPosture) {
      score += 0.35;
      hits.push("inertia");
    }
    score += riskBonus(text, tokens, posture.id);
    if (score > best.score) best = { score, posture, hits };
  }

  let { score, posture, hits } = best;
  if (score <= 0) {
    posture = CATALOG.postures.find((p) => p.id === "forensic-debugger") ?? CATALOG.postures[0];
    score = 0.1;
    hits = ["default: coding task with no stronger signal"];
  }

  return {
    id: posture.id,
    label: posture.label,
    description: posture.description,
    score: Math.round(score * 1000) / 1000,
    reason: hits.slice(0, 6).join(", ") || "default selection",
    warnings: warnings(text, tokens, posture.id),
    axes: posture.axes,
    rules: posture.rules,
    agent
  };
}

function renderPosture(result: PostureResult, task?: string, compact = false): string {
  const lines = [`Coding posture: ${result.id} — ${result.label}`, `Reason: ${result.reason}`];
  if (result.warnings.length > 0) lines.push(`Risk warnings: ${result.warnings.join("; ")}`);
  lines.push("Rules:");
  for (const rule of result.rules.slice(0, compact ? 3 : 6)) lines.push(`- ${rule}`);
  lines.push("Pi adapter: this posture constrains execution policy only; project/user/safety instructions remain higher priority.");
  if (task) lines.push("", "Task:", task);
  return lines.join("\n");
}

function appendEphemeralPostureMessage(messages: any[], posture: PostureResult): any[] {
  return [
    ...messages,
    {
      role: "custom",
      customType: "coding-posture",
      content: renderPosture(posture, undefined, true),
      display: false,
      details: posture,
      timestamp: Date.now()
    }
  ];
}

export default function (pi: ExtensionAPI) {
  pi.on("context", async (event: any) => {
    const messages = Array.isArray(event.messages) ? event.messages : [];
    const latestUser = [...messages].reverse().find((m: any) => m?.role === "user");
    const content = typeof latestUser?.content === "string" ? latestUser.content : JSON.stringify(latestUser?.content ?? "");
    if (!looksCodingRelated(content)) return;
    const posture = selectPosture(content, "pi");
    return { messages: appendEphemeralPostureMessage(messages, posture) };
  });

  pi.registerCommand("posture", {
    description: "Select/render a coding-agent execution posture",
    handler: async (args: string, ctx: any) => {
      const raw = (args ?? "").trim();
      const render = raw.startsWith("render ");
      const task = render ? raw.slice("render ".length).trim() : raw;
      if (!task) {
        ctx.ui.notify("Usage: /posture <task> or /posture render <task>", "info");
        return;
      }
      const posture = selectPosture(task, "pi");
      ctx.ui.notify(render ? renderPosture(posture, undefined, false) : JSON.stringify(posture, null, 2), "info");
    }
  });

  pi.registerTool({
    name: "coding_posture_select",
    label: "Coding Posture Select",
    description: "Select a coding-agent execution posture for a task.",
    promptSnippet: "Select a task-aware coding posture such as forensic-debugger, surgical-fixer, or entropy-auditor.",
    promptGuidelines: ["Use coding_posture_select when a coding task needs an explicit risk/verification posture before delegating or editing."],
    parameters: Type.Object({
      prompt: Type.String({ description: "Task/request text" }),
      previousPosture: Type.Optional(Type.String({ description: "Optional previous posture id for inertia" }))
    }),
    async execute(_toolCallId: string, params: any) {
      const posture = selectPosture(params.prompt, "pi", params.previousPosture);
      return {
        content: [{ type: "text", text: JSON.stringify(posture, null, 2) }],
        details: posture
      };
    }
  });

  pi.registerTool({
    name: "coding_posture_render",
    label: "Coding Posture Render",
    description: "Render a concise posture prompt block for a Pi coding task.",
    promptSnippet: "Render a compact execution-policy block for a Pi coding task.",
    promptGuidelines: ["Use coding_posture_render before handing a task to another coding agent or when the user asks for a posture prompt."],
    parameters: Type.Object({
      prompt: Type.String({ description: "Task/request text" }),
      includeTask: Type.Optional(Type.Boolean({ description: "Append original task after the posture block" })),
      previousPosture: Type.Optional(Type.String({ description: "Optional previous posture id for inertia" }))
    }),
    async execute(_toolCallId: string, params: any) {
      const posture = selectPosture(params.prompt, "pi", params.previousPosture);
      const rendered = renderPosture(posture, params.includeTask ? params.prompt : undefined, false);
      return {
        content: [{ type: "text", text: rendered }],
        details: { posture, prompt: rendered }
      };
    }
  });
}
