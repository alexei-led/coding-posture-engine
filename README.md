# Coding Posture Engine

Task-aware operating modes for coding agents. It is a small Hermes plugin, a Pi package, and a standalone CLI prompt wrapper for Claude Code, Codex, and Pi-style agent commands.

The point is not to make coding agents theatrical. The point is to stop them from behaving like optimistic elevators with write access.

## What it does

Given a task prompt, the engine selects a **coding posture** such as:

- `forensic-debugger` — reproduce first, gather evidence, isolate root cause.
- `surgical-fixer` — minimal low-risk fix, no opportunistic cleanup.
- `entropy-auditor` — review/security posture for invariants and edge cases.
- `test-zealot` — TDD-heavy posture for behavior changes.
- `prototype-goblin` — isolated spike mode.
- `ops-runner` — git, CI, build, release, and package-manager chores.
- `cautious-migrator` — migrations/infra with rollback thinking.
- `stuck-investigator` — stop thrashing after repeated failures.

It can then render a compact prompt block for another coding agent.

## Pi package install

Pi packages are installed from git/npm/local paths. This repository now declares Pi resources in `package.json` under the `pi` key:

- `extensions/coding-posture.ts` — Pi extension with ephemeral `context` injection, `/posture`, and tools.
- `skills/coding-posture/SKILL.md` — Pi skill for posture selection discipline.
- `prompts/posture-task.md` — `/posture-task` prompt template for explicit posture runs without conflicting with the extension command.

Install from GitHub:

```bash
pi install git:github.com/alexei-led/coding-posture-engine@v0.1.2
# or test without installing for the current run:
pi -e git:github.com/alexei-led/coding-posture-engine@v0.1.2
```

Local development:

```bash
pi install /Users/alexei/projects/coding-posture-engine
# or temporary:
pi -e /Users/alexei/projects/coding-posture-engine
```

The Pi extension registers:

- `context` hook — injects an ephemeral hidden posture message for coding-related prompts without storing it in the session.
- `/posture` command — select or render a posture in the TUI.
- `coding_posture_select` tool — returns selected posture JSON.
- `coding_posture_render` tool — returns a posture prompt block.

## Hermes plugin install

Directory install:

```bash
git clone https://github.com/alexei-led/coding-posture-engine ~/.hermes/plugins/coding-posture-engine
hermes config set plugins.enabled '["coding-posture-engine"]'
# restart Hermes / gateway or start a new session
```

The plugin registers:

- `pre_llm_call` hook — injects a compact posture block into coding-related Hermes turns.
- `/posture` slash command — select or render a posture in chat.
- `coding_posture_select` tool — returns selected posture JSON.
- `coding_posture_render` tool — returns selected posture plus prompt block.

## CLI install

```bash
git clone https://github.com/alexei-led/coding-posture-engine
cd coding-posture-engine
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e .
```

## CLI usage

Select posture:

```bash
coding-posture select fix failing pytest regression with traceback
```

Render prompt for Claude Code:

```bash
coding-posture --agent claude render --include-task fix failing pytest regression
```

Run Claude Code with posture prompt:

```bash
coding-posture --agent claude run fix failing pytest regression
```

Run Codex with posture prompt:

```bash
coding-posture --agent codex run review auth diff for security regressions
```

Generic Pi CLI wrapper:

```bash
# Uses `pi -p` by default and passes the whole posture+task prompt as one argument.
PI_CLI=pi coding-posture --agent pi run prototype a small API client
```

For native Pi package integration, prefer `pi install git:github.com/alexei-led/coding-posture-engine@v0.1.2`.

## Safety model

Priority order:

```text
system/safety > user instruction > project rules > task plan > coding posture > style
```

A posture may increase verification, reduce risk tolerance, or constrain diff size. It must never authorize unsafe commands, fabricate test results, or ignore project instructions.

## Development

Run tests:

```bash
python3 -m pytest -q
```

Run without installing:

```bash
PYTHONPATH=. python3 -m coding_posture_engine.cli --agent claude render --include-task fix failing tests
```

## Repository status

This is an MVP. The initial version is deliberately small:

- no model calls;
- no network calls;
- no secrets;
- no Hermes source patches;
- deterministic heuristic selection.

Future work:

- learn from task outcomes;
- add Kanban task metadata support;
- add richer wrappers for specific external CLIs;
- expose a stable JSON schema for posture cards.
