#!/usr/bin/env bash
# Evaluate the coding-posture skill by REUSING cc-thingz's `agent-skills-eval`
# runner (LLM-judge, with/without-skill baseline). The skill lives in this repo,
# outside the cc-thingz monorepo, so we assemble the layout the runner expects
# (<root>/<plugin>/skills/<skill>/{SKILL.md,evals/evals.json}) and invoke it.
#
# Paid + stochastic. Needs Node (npx) and an OpenAI-compatible key.
#   OPENAI_API_KEY=sk-... bash eval/run-skill-evals.sh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
skill_src="$repo_root/skills/coding-posture"
evals_src="$repo_root/tests/skill-evals/coding-posture/evals"

# Load a local .env (gitignored) if present, so the run is self-contained.
if [ -f "$repo_root/.env" ]; then
	set -a
	# shellcheck disable=SC1091
	. "$repo_root/.env"
	set +a
fi

plugin="coding-posture"
skill="coding-posture"
root="${SKILL_EVAL_ROOT:-/tmp/coding-posture-skill-eval-root}"
ws="${SKILL_EVAL_WORKSPACE:-/tmp/coding-posture-skill-eval-workspace}"
target="${SKILL_EVAL_TARGET:-gpt-5.4-mini}"
judge="${SKILL_EVAL_JUDGE:-gpt-5.4-mini}"
cli="${SKILL_EVAL_CLI:-npx --yes agent-skills-eval}"

: "${OPENAI_API_KEY:?set OPENAI_API_KEY — agent-skills-eval makes paid model calls}"

dest="$root/$plugin/skills/$skill"
rm -rf "$root"
mkdir -p "$dest" "$ws"
cp "$skill_src/SKILL.md" "$dest/SKILL.md"
cp -R "$evals_src" "$dest/evals"

# shellcheck disable=SC2086
$cli "$root" \
	--include "$plugin/skills/$skill" \
	--workspace "$ws" \
	--baseline \
	--target "$target" \
	--judge "$judge" \
	--base-url "${SKILL_EVAL_BASE_URL:-https://api.openai.com/v1}" \
	--api-key-env OPENAI_API_KEY \
	--concurrency "${SKILL_EVAL_CONCURRENCY:-4}" \
	--layout iteration \
	--report
