# Coding posture — always-on rules

Paste this into your `CLAUDE.md` or `AGENTS.md`. These are the always-true invariants you want on every turn; the full per-task mode checklists live in the `coding-posture` skill, which is canonical if the two ever diverge.

- Before non-trivial coding work, pick a mode — debug, fix, review, test-first, refactor, optimize, migrate, upgrade, integrate, spike, unstuck — and state it in one line: `Mode: <name> — <reason>`. See the coding-posture skill for each mode's checklist.
- Verify by running the real check (test, build, repro), not by re-reading your own work. If you cannot run it, say so and mark the result unverified; never assume it passed.
- Never report a result you did not run; never weaken, delete, skip, or special-case a test — or hard-code an expected value — to turn it green. Solve the task, not the grader.
- Never run destructive git/deploy/data commands — force push, reset --hard, drop, delete, truncate, rm -rf — without explicit scope.
