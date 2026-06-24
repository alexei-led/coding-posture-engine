"""CLI for rendering/running coding postures with external coding agents."""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from typing import List

from .engine import load_default_engine


def _build_agent_command(agent: str, prompt: str) -> List[str]:
    if agent in {"claude", "claude-code"}:
        exe = os.environ.get("CLAUDE_CLI", "claude")
        return [exe, "-p", prompt]
    if agent in {"codex", "openai-codex"}:
        exe = os.environ.get("CODEX_CLI", "codex")
        return [exe, "exec", prompt]
    if agent == "pi":
        exe = os.environ.get("PI_CLI", "pi")
        return [exe, "-p", prompt]
    raise SystemExit(f"Unsupported agent: {agent}")


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="coding-posture")
    parser.add_argument("--agent", default="generic", choices=["generic", "hermes", "claude", "claude-code", "codex", "openai-codex", "pi"])
    parser.add_argument("--previous-posture", default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    p_select = sub.add_parser("select", help="Select posture as JSON")
    p_select.add_argument("task", nargs="*", help="Task text")

    p_render = sub.add_parser("render", help="Render posture prompt block")
    p_render.add_argument("task", nargs="*", help="Task text")
    p_render.add_argument("--include-task", action="store_true", help="Include task in rendered prompt")

    p_run = sub.add_parser("run", help="Run Claude/Codex/Pi with posture prompt")
    p_run.add_argument("task", nargs="*", help="Task text")
    p_run.add_argument("--dry-run", action="store_true", help="Print command instead of executing")

    args = parser.parse_args(argv)
    task = " ".join(getattr(args, "task", [])).strip()
    if not task:
        task = sys.stdin.read().strip()
    if not task:
        parser.error("task text is required via args or stdin")

    engine = load_default_engine()
    result = engine.select(task, agent=args.agent, previous_posture=args.previous_posture)

    if args.command == "select":
        import json
        print(json.dumps(result.to_dict(), ensure_ascii=False, indent=2))
        return 0

    include_task = args.command == "run" or getattr(args, "include_task", False)
    rendered = engine.render_prompt(result, task=task if include_task else None, agent=args.agent)
    if args.command == "render":
        print(rendered)
        return 0

    if args.agent in {"generic", "hermes"}:
        raise SystemExit("run requires --agent claude, --agent codex, or --agent pi")
    cmd = _build_agent_command(args.agent, rendered)
    if args.dry_run:
        import shlex
        print(" ".join(shlex.quote(part) for part in cmd))
        return 0
    if shutil.which(cmd[0]) is None:
        raise SystemExit(f"Agent CLI not found: {cmd[0]}")
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
