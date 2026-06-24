import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

type Posture = {
  id: string;
  label: string;
  description: string;
  triggers: string[];
  axes: Record<string, string>;
  rules: string[];
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

const POSTURES: Posture[] = [
  {
    id: "forensic-debugger",
    label: "Forensic debugger",
    description: "Reproduce first, gather evidence, isolate root cause, then make the smallest fix.",
    triggers: ["bug", "failing test", "regression", "traceback", "exception", "debug", "pytest", "failure"],
    axes: { risk_tolerance: "low", exploration: "medium", verification_strictness: "high", diff_budget: "small", autonomy: "medium", skepticism: "high" },
    rules: [
      "Reproduce the failure before editing when practical.",
      "State the observed failure exactly.",
      "Change one hypothesis at a time.",
      "Prefer minimal fixes over broad refactors.",
      "Verify against the original failing command before declaring done."
    ]
  },
  {
    id: "surgical-fixer",
    label: "Surgical fixer",
    description: "Minimal, low-risk fix for a known problem; no opportunistic cleanup.",
    triggers: ["hotfix", "quick fix", "small fix", "patch", "minimal", "urgent"],
    axes: { risk_tolerance: "low", exploration: "low", verification_strictness: "medium_high", diff_budget: "tiny", autonomy: "medium", skepticism: "high" },
    rules: [
      "Keep the diff as small as possible.",
      "Do not refactor unrelated code.",
      "Avoid dependency or config changes unless required.",
      "Add a focused regression test when feasible.",
      "Report residual risk explicitly."
    ]
  },
  {
    id: "entropy-auditor",
    label: "Entropy auditor",
    description: "Review/security posture: invariants, edge cases, backwards compatibility, and operational risk.",
    triggers: ["review", "security", "auth", "payment", "secret", "token", "unsafe", "audit", "threat"],
    axes: { risk_tolerance: "very_low", exploration: "low", verification_strictness: "high", diff_budget: "none_or_small", autonomy: "low_medium", skepticism: "very_high" },
    rules: [
      "Check correctness, security, and backwards compatibility.",
      "Look for hidden coupling and missing tests.",
      "Do not approve claims without evidence.",
      "Prefer concrete file/line findings.",
      "Escalate if risk is high or ambiguous."
    ]
  },
  {
    id: "test-zealot",
    label: "Test zealot",
    description: "TDD-heavy posture for behavior changes and regression-prone code.",
    triggers: ["tdd", "test first", "coverage", "regression test", "unit test", "integration test"],
    axes: { risk_tolerance: "low", exploration: "medium", verification_strictness: "very_high", diff_budget: "small", autonomy: "medium", skepticism: "high" },
    rules: [
      "Write or identify the failing test first.",
      "Observe the RED failure before implementation.",
      "Make the smallest change to pass.",
      "Run focused tests, then relevant broader tests.",
      "Refactor only while tests stay green."
    ]
  },
  {
    id: "prototype-goblin",
    label: "Prototype goblin",
    description: "Fast isolated spike to validate an idea or unknown library; optimize for learning, not polish.",
    triggers: ["spike", "prototype", "poc", "proof of concept", "experiment", "try", "explore"],
    axes: { risk_tolerance: "medium", exploration: "high", verification_strictness: "low_medium", diff_budget: "isolated", autonomy: "high", skepticism: "medium" },
    rules: [
      "Keep spike artifacts isolated.",
      "Optimize for learning speed, not production quality.",
      "Do not wire experimental code into production paths without review.",
      "End with verdict: validated, invalidated, or unclear.",
      "List what would be needed to productionize."
    ]
  },
  {
    id: "janitor-refactor",
    label: "Janitor refactor",
    description: "Simplify and clean up while preserving behavior.",
    triggers: ["refactor", "cleanup", "simplify", "technical debt", "dead code", "rename"],
    axes: { risk_tolerance: "medium_low", exploration: "medium", verification_strictness: "high", diff_budget: "medium", autonomy: "medium", skepticism: "high" },
    rules: [
      "Preserve behavior unless explicitly asked otherwise.",
      "Separate refactor from behavior changes.",
      "Delete complexity before adding abstraction.",
      "Rely on tests or golden outputs to prove equivalence.",
      "Keep commits/diffs reviewable."
    ]
  },
  {
    id: "cautious-migrator",
    label: "Cautious migrator",
    description: "Schema/data/infra migration posture with rollback and staged verification.",
    triggers: ["migration", "migrate", "schema", "database", "terraform", "kubernetes", "helm", "deploy", "rollback"],
    axes: { risk_tolerance: "very_low", exploration: "low", verification_strictness: "very_high", diff_budget: "small", autonomy: "low_medium", skepticism: "very_high" },
    rules: [
      "Identify backup and rollback path before changing stateful systems.",
      "Prefer staged, reversible changes.",
      "Do not run destructive commands without explicit scope.",
      "Validate against a non-production target when possible.",
      "Document operational risks and recovery steps."
    ]
  },
  {
    id: "doc-scribe-despair",
    label: "Doc scribe despair",
    description: "Documentation/planning posture with structured output and acceptance criteria.",
    triggers: ["docs", "readme", "documentation", "plan", "proposal", "design doc", "adr"],
    axes: { risk_tolerance: "low", exploration: "medium", verification_strictness: "medium", diff_budget: "text_only", autonomy: "high", skepticism: "medium_high" },
    rules: [
      "Make structure obvious.",
      "Include examples and acceptance criteria.",
      "Avoid vague best-practice prose.",
      "Keep claims verifiable.",
      "Prefer concise docs users can act on."
    ]
  },
  {
    id: "architect-orbit",
    label: "Architect orbit",
    description: "System design posture: boundaries, tradeoffs, failure modes, and future constraints.",
    triggers: ["architecture", "design", "system", "api", "interface", "tradeoff", "scalability"],
    axes: { risk_tolerance: "medium", exploration: "medium_high", verification_strictness: "medium_high", diff_budget: "plan_first", autonomy: "medium", skepticism: "high" },
    rules: [
      "Map constraints and non-goals.",
      "Compare options with tradeoffs.",
      "Name failure modes and operational concerns.",
      "Avoid speculative infrastructure without a consumer.",
      "End with a concrete next step."
    ]
  },
  {
    id: "stuck-investigator",
    label: "Stuck investigator",
    description: "Stop thrashing after repeated failures; summarize evidence and narrow hypotheses.",
    triggers: ["still failing", "again", "flaky", "stuck", "loop", "cannot reproduce", "same failure"],
    axes: { risk_tolerance: "very_low", exploration: "low", verification_strictness: "high", diff_budget: "none_until_hypothesis", autonomy: "low", skepticism: "very_high" },
    rules: [
      "Stop making speculative edits.",
      "Summarize attempts and evidence.",
      "List the top two hypotheses and discriminating tests.",
      "Ask for or collect missing information before more changes.",
      "Consider delegating review."
    ]
  }
];

const HIGH_RISK = ["auth", "payment", "payments", "billing", "secrets", "migrations", "terraform", "k8s", "kubernetes", "helm", "infra"];
const DESTRUCTIVE = ["delete", "drop", "destroy", "reset", "purge", "truncate", "force push", "force-push"];
const CODING_SIGNALS = ["code", "repo", "git", "test", "pytest", "npm", "build", "ci", "bug", "fix", "diff", "pr", "pull request", "refactor", "function", "class", "api", "deploy", "python", "typescript", "javascript", "go", "docker", "kubernetes", "terraform"];

function looksCodingRelated(text: string): boolean {
  const t = text.toLowerCase();
  return CODING_SIGNALS.some((s) => t.includes(s));
}

function tokenize(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-zA-Z0-9_.\/-]+/g) ?? []));
}

function riskBonus(text: string, id: string): number {
  const highRisk = HIGH_RISK.some((p) => text.includes(p));
  const destructive = DESTRUCTIVE.some((w) => text.includes(w));
  if ((highRisk || destructive) && (id === "entropy-auditor" || id === "cautious-migrator")) return 3;
  if (destructive && id === "surgical-fixer") return -1;
  return 0;
}

function warnings(text: string, id: string): string[] {
  const out: string[] = [];
  if (HIGH_RISK.some((p) => text.includes(p))) out.push("high-risk path/domain detected; keep risk tolerance low");
  if (DESTRUCTIVE.some((w) => text.includes(w))) out.push("destructive wording detected; require explicit scope and rollback");
  if (id === "prototype-goblin" && out.length > 0) out.push("prototype posture must stay isolated from production paths");
  return out;
}

function selectPosture(prompt: string, agent = "pi", previousPosture?: string): PostureResult {
  const text = prompt.toLowerCase();
  const tokens = tokenize(prompt);
  let best = { score: Number.NEGATIVE_INFINITY, posture: POSTURES[0], hits: [] as string[] };
  for (const posture of POSTURES) {
    let score = 0;
    const hits: string[] = [];
    for (const trig of posture.triggers) {
      const t = trig.toLowerCase();
      if (t.includes(" ") ? text.includes(t) : tokens.has(t) || text.includes(t)) {
        score += t.includes(" ") ? 2 : 1.2;
        hits.push(trig);
      }
    }
    if (previousPosture && posture.id === previousPosture) {
      score += 0.35;
      hits.push("inertia");
    }
    score += riskBonus(text, posture.id);
    if (score > best.score) best = { score, posture, hits };
  }
  let { score, posture, hits } = best;
  if (score <= 0) {
    posture = POSTURES[0];
    score = 0.1;
    hits = ["default: coding task with no stronger signal"];
  }
  return {
    id: posture.id,
    label: posture.label,
    description: posture.description,
    score: Math.round(score * 1000) / 1000,
    reason: hits.slice(0, 6).join(", ") || "default selection",
    warnings: warnings(text, posture.id),
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

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event: any) => {
    const prompt = String(event.prompt ?? "");
    if (!looksCodingRelated(prompt)) return;
    const posture = selectPosture(prompt, "pi");
    return {
      message: {
        customType: "coding-posture",
        content: renderPosture(posture, undefined, true),
        display: false,
        details: posture
      }
    };
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
