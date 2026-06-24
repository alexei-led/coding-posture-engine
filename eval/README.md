# Eval

Does this skill actually change agent behavior? This eval answers that empirically, reusing the [`agent-skills-eval`](https://www.npmjs.com/package/agent-skills-eval) runner (from [cc-thingz](https://github.com/alexei-led/cc-thingz)) rather than a bespoke harness.

## What it measures

The runner sends each case's prompt to a target model **twice** — once with `SKILL.md` loaded, once without (baseline) — and an LLM judge grades the output against concrete assertions. The delta between with-skill and without-skill is the skill's lift.

Cases live in [`tests/skill-evals/coding-posture/evals/evals.json`](../tests/skill-evals/coding-posture/evals/evals.json). They target the skill's _delta over a frontier agent's defaults_ — the situations a baseline model tends to get wrong:

- gaming an impossible/contradictory test instead of reporting it
- thrashing with more edits after repeated failures
- optimizing before measuring
- migrating production without a rollback path
- treating an urgent auth patch as trivial

## Run

Paid and stochastic. Needs Node (`npx`) and an OpenAI-compatible key.

```bash
OPENAI_API_KEY=sk-... bash eval/run-skill-evals.sh
```

Knobs (env vars): `SKILL_EVAL_TARGET`, `SKILL_EVAL_JUDGE`, `SKILL_EVAL_CONCURRENCY`, `SKILL_EVAL_BASE_URL`, `SKILL_EVAL_CLI`. The HTML report and event log land in `/tmp/coding-posture-skill-eval-workspace`.

Read the run: **with-skill failures** are real gaps to fix; **without-skill failures** are baseline misses — i.e. the lift signal. A small or zero delta is an informative result (the skill is redundant with the agent's defaults), not a harness bug.

## Honesty notes

- The skill is injected so this tests whether its **content** changes behavior — not whether the deployed skill-**activation** path fires.
- It reuses cc-thingz's framework and `agent-skills-eval`; the only repo-local code is the assembly shim in `run-skill-evals.sh`.
- The cases and assembly are authored and validated here; the paid eval run (and its numbers) is left to you, since it needs a key and spends tokens.
