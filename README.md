# Coding Posture

A small skill that gives coding agents **task-aware working modes**. Before non-trivial work, the agent picks a mode — `debug`, `fix`, `review`, `test-first`, `refactor`, `optimize`, `migrate`, `upgrade`, `integrate`, `spike`, `unstuck` — and follows its checklist.

The point is not to make agents theatrical. It is to stop them from behaving like optimistic elevators with write access: thrashing on a stuck bug, faking green tests, skipping reproduction, running destructive commands, or migrating without a rollback.

## How it works — theory and evidence

The whole product is one file: [`skills/coding-posture/SKILL.md`](skills/coding-posture/SKILL.md). No engine, no code — the agent reads the modes and picks the one that fits. So the real question is why a short procedural checklist in the context changes what a model does. Each claim below is labelled by how strong the evidence actually is.

**Mechanism: in-context conditioning** _(well-supported substrate, not a complete theory)._ A worked procedure acts as an in-context demonstration — the model conditions its next tokens on the shown trajectory, not just the final answer. This is the mechanism behind chain-of-thought ([Wei et al., 2022](https://arxiv.org/abs/2201.11903)). Mechanistic work traces part of in-context learning to specific attention circuits — induction heads ([Olsson et al., 2022](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html)) and iteration heads ([NeurIPS 2024](https://proceedings.neurips.cc/paper_files/paper/2024/file/c50f8180ef34060ec59b75d6e1220f7a-Paper-Conference.pdf)) — and a formal [ICL analysis of CoT (ICML 2024)](https://icml.cc/virtual/2024/38391). No complete mechanistic theory of frontier-model reasoning exists yet; this is a grounded substrate, not a proof.

**Procedures, not personas** _(supported guideline, not a universal law)._ A persona ("act as an expert debugger") mostly sets style; a procedure supplies structure the model can follow. Adding personas to system prompts does not reliably improve accuracy ([Zheng et al., EMNLP 2024](https://aclanthology.org/2024.findings-emnlp.888/)), whereas process prompting does on reasoning tasks ([self-consistency](https://arxiv.org/abs/2203.11171); role-play helps mainly [as an implicit CoT trigger](https://arxiv.org/html/2308.07702v2)). So each mode is a checklist, not a character. This is a robust empirical guideline for reasoning-heavy work — not proven for every task.

**The model self-selects; no keyword router** _(holds for strong models, not universally)._ Choosing the right procedure from context is a meta-reasoning step strong models do well, and context-based selection beats brittle keyword matching ([Route-to-Reason, 2025](https://arxiv.org/abs/2505.19435)). Honest caveat: self-selection is not categorically better than a fixed router — it depends on a strong, calibrated model. The targets here (Claude, Codex, etc.) qualify; a weak model would need a trained router instead.

**What the checklists encode** _(highest-evidence levers; documented failure modes)._ Ground "done" in a real run rather than re-reading ([self-debug, Chen et al. 2023](https://arxiv.org/abs/2304.05128); [intrinsic self-correction degrades without external feedback, Huang et al. 2023](https://arxiv.org/abs/2310.01798)); gather context before editing instead of rushing to patch ([Beyond Resolution Rates, 2026](https://arxiv.org/abs/2604.02547)); refuse to game the grader ([verifier gaming, 2026](https://arxiv.org/abs/2604.15149)). That structured procedures improve coding-agent reliability is directionally supported across agent and benchmark studies — but there is no single clean checklist-vs-free-form RCT, which is exactly why this repo ships its own eval rather than asserting an effect.

**Evidence from our own eval** _(directional; one run, one model)._ [`eval/`](eval/) runs each task with and without the skill (LLM judge + baseline; reuses `agent-skills-eval`). On the current 5-case set: **+15pp** (numbers in Status). A single run on `gpt-5.4-mini` that injects the skill text — so it tests whether the content shifts behavior, not the deployed activation path, and it is directional evidence, not a settled effect size.

**Why it stays small** _(real effect, no magic number)._ Instruction-following degrades as a prompt grows long and complex, so a short, relevant, followable procedure conditions behavior more reliably than a long aspirational document. The simplicity is the design. (Beware the widely repeated "LLMs follow ~150–200 instructions" figure — it has no peer-reviewed source; the real, unquantified effect is degradation with length and complexity.)

## Install

It is a standard [`SKILL.md`](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) skill, so it works unmodified across compatible agents.

**Hermes:** drop `skills/coding-posture/` into `~/.hermes/skills/` (the default skills dir); Hermes auto-discovers it on startup. It also supports installing a skill by hub name or from a URL — see the [Hermes skills docs](https://hermes-agent.nousresearch.com/docs/guides/work-with-skills) for the current command.

**Claude Code / Codex / Cursor:** copy `skills/coding-posture/` into the agent's skills directory (e.g. `~/.claude/skills/coding-posture/`).

**Pi:**

```bash
pi install git:github.com/alexei-led/coding-posture
```

The agent activates the skill from its `description` when a coding task starts.

## Modes

| Mode         | Use when                                 | Core discipline                                     |
| ------------ | ---------------------------------------- | --------------------------------------------------- |
| `debug`      | failing test, bug, regression            | reproduce first, one hypothesis at a time           |
| `fix`        | small known urgent change                | smallest diff, no opportunistic cleanup             |
| `review`     | security/auth/payments, reviewing a diff | no approval without file/line evidence              |
| `test-first` | behavior change, tests practical         | see RED before implementing, never fake green       |
| `refactor`   | cleanup, simplify, rename                | preserve behavior, trace call sites before deleting |
| `optimize`   | performance work, hot path               | measure first, baseline before/after                |
| `migrate`    | schema/data/infra change                 | rollback path before touching state                 |
| `upgrade`    | dependency or version bump               | read breaking changes, no blind search-replace      |
| `integrate`  | calling an external API/service          | read the contract, handle the error paths           |
| `spike`      | prototype, PoC, unknown library          | isolate, end with a verdict                         |
| `unstuck`    | repeated failures, thrashing             | stop editing, summarize evidence, narrow hypotheses |

Plus invariants that hold in every mode: no destructive commands without explicit scope, verify by running the real check (not by re-reading — [self-correction without external feedback degrades results](https://arxiv.org/abs/2310.01798)), and never report a result you did not run. The modes lean on the practices with the strongest evidence for coding agents: tight [execution-feedback loops](https://arxiv.org/abs/2304.05128), [gathering context before editing rather than rushing to patch](https://arxiv.org/abs/2604.02547), precise fault localization, small diffs, [clarifying underspecified requirements before coding](https://arxiv.org/pdf/2310.10996), and refusing to [game the tests](https://arxiv.org/abs/2604.15149).

## Where this fits

Coding agents already enforce baseline discipline in their system prompts (reproduce bugs, run tests, small diffs), and good `CLAUDE.md`/`AGENTS.md` files repeat it. This skill earns its place only as the _delta_: the anti-instincts agents get wrong by default — stop thrashing, don't game the grader, roll back before migrating, measure before optimizing, read the API contract — plus a catalog of task modes too large to keep always-on.

Two load disciplines, and the split matters:

- **Always-on** (`CLAUDE.md` / `AGENTS.md`, system prompt): universal invariants you want on every turn. The "Always" block here — verify by running, never fake green, no destructive commands without scope — is most reliable when you also paste it into your always-on instructions, because a conditionally-loaded skill can fail to activate. [`always-on-snippet.md`](always-on-snippet.md) is that block, ready to paste.
- **Conditional** (this skill): the per-task mode checklists, loaded only when relevant. That is the reason this is a skill and not eleven checklists bloating every turn.

[Anthropic's skill guidance](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) is evaluation-driven: keep only what measurably closes a gap. See Status.

## Status

This is an MVP. The bet is that procedural checklists aimed at known model failure modes are useful defaults. **Initial numbers support it:** the behavioral eval ([`eval/`](eval/)) shows **85% with-skill vs 70% without (+15pp)**; the auth-urgency case specifically went 4/4 with-skill vs 2/4 without. These are single-run numbers on one model — treat them as directional, not definitive.

Future work: run broader evals across models and refine the mode set from what actually moves outcomes.
