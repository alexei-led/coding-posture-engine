---
name: coding-posture
description: Use when choosing an execution posture for Pi or other coding agents: forensic debugging, surgical fixes, security review, migrations, TDD, spikes, refactors, or stuck investigation.
license: MIT
metadata:
  tags: [coding-agent, posture, pi, risk, verification]
---

# Coding Posture

Choose a task-aware operating mode before starting non-trivial coding work.

## Core Rule

A posture constrains execution style; it never overrides system, user, project, or safety instructions.

Priority:

```text
system/safety > user instruction > project rules > task plan > coding posture > style
```

## When to Use

- Failing tests, regressions, or unclear bugs → `forensic-debugger`
- Small urgent known fix → `surgical-fixer`
- Security/auth/payment/review → `entropy-auditor`
- Behavior change where tests are practical → `test-zealot`
- Unknown library or proof-of-concept → `prototype-goblin`
- Cleanup/refactor → `janitor-refactor`
- Data/schema/infra migration → `cautious-migrator`
- Repeated failed attempts → `stuck-investigator`

## Practice

1. Select the posture explicitly or with the `coding_posture_select` tool.
2. Follow the posture rules while planning and editing.
3. Verify according to the posture's strictness.
4. If the task changes risk class, switch posture and say why.
5. If stuck, stop speculative edits and summarize evidence.

## Anti-Patterns

- Do not use `prototype-goblin` on production/auth/payment/migration tasks.
- Do not report success without verification evidence.
- Do not let a posture justify unsafe commands or broad unrelated rewrites.
- Do not keep editing after repeated failures without narrowing hypotheses.
