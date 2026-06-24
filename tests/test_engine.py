from pathlib import Path

from coding_posture_engine import load_default_engine
from coding_posture_engine import plugin


def test_selects_forensic_debugger_for_failing_tests():
    engine = load_default_engine()
    result = engine.select("Fix failing pytest regression with traceback")
    assert result.posture["id"] == "forensic-debugger"
    assert any("Reproduce" in rule for rule in result.posture["rules"])


def test_high_risk_auth_review_selects_entropy_or_migrator():
    engine = load_default_engine()
    assert engine.looks_coding_related("review auth token handling for security")
    result = engine.select("review auth token handling for security")
    assert result.posture["id"] in {"entropy-auditor", "cautious-migrator"}
    assert result.warnings


def test_render_includes_agent_adapter():
    engine = load_default_engine()
    result = engine.select("quick fix a small bug", agent="claude")
    rendered = engine.render_prompt(result, task="quick fix a small bug", agent="claude")
    assert "Coding posture:" in rendered
    assert "Claude Code adapter" in rendered
    assert "Task:" in rendered


def test_single_word_triggers_do_not_match_inside_words():
    engine = load_default_engine()
    assert not engine.looks_coding_related("what is the capital of France?")
    result = engine.select("what is the capital of France?")
    assert result.posture["id"] != "architect-orbit"


def test_ops_runner_handles_git_and_ci_chores():
    engine = load_default_engine()
    result = engine.select("use git to commit changes and push after CI passes")
    assert result.posture["id"] == "ops-runner"


def test_pi_prompt_template_does_not_conflict_with_posture_command():
    assert Path("prompts/posture-task.md").exists()
    assert not Path("prompts/posture.md").exists()


def test_hermes_plugin_registers_hook_command_and_tools():
    class FakeCtx:
        def __init__(self):
            self.hooks = []
            self.commands = []
            self.tools = []

        def register_hook(self, name, handler):
            self.hooks.append((name, handler))

        def register_command(self, name, **kwargs):
            self.commands.append((name, kwargs))

        def register_tool(self, **kwargs):
            self.tools.append(kwargs)

    ctx = FakeCtx()
    plugin.register(ctx)
    assert [h[0] for h in ctx.hooks] == ["pre_llm_call"]
    assert ctx.commands[0][0] == "posture"
    assert {t["name"] for t in ctx.tools} == {"coding_posture_select", "coding_posture_render"}
    injected = ctx.hooks[0][1](user_message="fix failing pytest test")
    assert injected and "forensic-debugger" in injected["context"]
