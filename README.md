# Coding Posture

A small skill that gives coding agents **task-aware working modes**. Before non-trivial work, the agent picks a mode — `debug`, `fix`, `review`, `test-first`, `refactor`, `optimize`, `migrate`, `upgrade`, `integrate`, `spike`, `unstuck` — and follows its checklist.

The point is not to make agents theatrical. It is to stop them from behaving like optimistic elevators with write access: thrashing on a stuck bug, faking green tests, skipping reproduction, running destructive commands, or migrating without a rollback.

## Design

The whole product is one file: [`skills/coding-posture/SKILL.md`](skills/coding-posture/SKILL.md). There is no selection engine and no code. The agent reads the modes and chooses the one that fits the task's context.

Two deliberate choices, both grounded in research:

- **Modes are procedures, not personas.** Naming a role ("act as an expert debugger") does not reliably change model behavior ([Zheng et al., EMNLP 2024](https://aclanthology.org/2024.findings-emnlp.888/)). Specifying a _procedure_ does ([self-consistency / CoT](https://arxiv.org/abs/2203.11171); role-play helps only [as an implicit CoT trigger](https://arxiv.org/html/2308.07702v2)). So each mode is a checklist, not a character.
- **The model self-selects; no keyword router.** Context-based strategy selection beats fixed keyword rules ([Route-to-Reason, 2025](https://arxiv.org/html/2505.19435v1)), and self-selection works on strong models — exactly the targets here. So selection lives in the agent, not in a brittle scoring table.

## Install

It is a standard [`SKILL.md`](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) skill, so it works unmodified across compatible agents.

**Hermes:** drop `skills/coding-posture/` into `~/.hermes/skills/` (the default skills dir); Hermes auto-discovers it on startup. It also supports installing a skill by hub name or from a URL — see the [Hermes skills docs](https://hermes-agent.nousresearch.com/docs/guides/work-with-skills) for the current command.

**Claude Code / Codex / Cursor:** copy `skills/coding-posture/` into the agent's skills directory (e.g. `~/.claude/skills/coding-posture/`).

**Pi:**

```bash
pi install git:github.com/alexei-led/coding-posture-engine
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

This is an MVP. The bet is that procedural checklists aimed at known model failure modes are useful defaults. **That bet is still unproven on numbers** — but it is now testable: [`eval/`](eval/) provides a with/without-skill behavioral eval that reuses the `agent-skills-eval` runner. Run it (paid) to measure lift; until then, treat the modes as disciplined defaults, not a guarantee.

Future work: run the eval and refine the mode set from what actually moves outcomes.
