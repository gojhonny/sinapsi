#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

for path in \
  cli/graph \
  cli/readme.md \
  cli/src/graph.sh \
  cli/src/core/common.sh \
  cli/src/core/output.sh \
  cli/src/core/shell-syntax.sh \
  cli/src/commands/bootstrap.sh \
  cli/src/commands/setup.sh \
  cli/src/commands/setup-launcher.sh \
  cli/src/commands/setup-project.sh \
  cli/src/commands/doctor.sh \
  cli/src/commands/cleanup.sh \
  cli/src/commands/lint.sh \
  cli/src/commands/typecheck.sh \
  cli/src/commands/test.sh \
  cli/src/commands/dev.sh \
  cli/src/commands/build.sh \
  cli/src/commands/audit.sh \
  cli/src/commands/check.sh \
  cli/src/commands/help.sh \
  cli/src/commands/git-setup.sh \
  cli/src/commands/git-doctor.sh \
  cli/src/commands/git-pre-commit.sh \
  cli/src/commands/git-commit-msg.sh \
  cli/src/commands/git-lint.sh \
  cli/src/commands/git-version-check.sh
do
  if [ -f "$path" ]; then pass "$path"; else fail "missing $path"; fi
done

for executable in cli/graph cli/src/graph.sh cli/src/commands/*.sh cli/src/core/shell-syntax.sh; do
  if [ -x "$executable" ]; then pass "$executable is executable"; else fail "$executable is not executable"; fi
done

shell_failures=0
for shell_file in cli/graph cli/src/*.sh cli/src/core/*.sh cli/src/commands/*.sh; do
  if ! /bin/sh -n "$shell_file"; then
    printf 'FAIL  invalid shell syntax: %s\n' "$shell_file" >&2
    shell_failures=$((shell_failures + 1))
  fi
done
if [ "$shell_failures" -eq 0 ]; then pass 'all Graph shell files pass /bin/sh -n'; else failures=$((failures + shell_failures)); fi

if [ -d sandbox ] && [ -f sandbox/index.html ] && [ ! -e demo ]; then
  pass 'sandbox replaces demo'
else
  fail 'expected sandbox/ and no demo/'
fi

if [ -x cli/.husky/pre-commit ] && [ -x cli/.husky/commit-msg ] && [ ! -e .husky ]; then
  pass 'Husky adapters live in cli/.husky'
else
  fail 'Husky adapters must live in cli/.husky without a root .husky directory'
fi

if find cli \( -path 'cli/.husky/_' -prune \) -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.ts' \) -print | grep . >/dev/null 2>&1; then
  fail 'CLI contains a non-shell implementation file'
else
  pass 'CLI implementation is shell-only'
fi

if grep -R -n -i -E 'k8s|container orchestrator|workspace task graph|product changelog|environment template' cli >/dev/null 2>&1; then
  fail 'CLI retains unrelated application or infrastructure behavior'
else
  pass 'CLI scope is specific to the Sinapsi library'
fi

for command in bootstrap setup doctor cleanup lint typecheck test dev build audit check help 'git setup' 'git doctor' 'git pre-commit' 'git commit-message' 'git lint' 'git version-check'; do
  if TERM=dumb ./cli/graph help | grep -F "$command" >/dev/null 2>&1; then
    pass "help documents $command"
  else
    fail "help does not document $command"
  fi
done

node <<'NODE' || failures=$((failures + 1))
const fs = require('node:fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const scripts = pkg.scripts ?? {}
const expected = ['pnpm:devPreinstall', 'prepack', 'setup']
const actual = Object.keys(scripts).sort()
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.error(`FAIL  package scripts must be exactly ${expected.join(', ')}; found ${actual.join(', ')}`)
  process.exit(1)
}
if (scripts['pnpm:devPreinstall'] !== './cli/graph setup --launcher --bootstrap') {
  console.error('FAIL  pnpm:devPreinstall must provision the managed Graph launcher')
  process.exit(1)
}
if (scripts.setup !== './cli/graph setup --launcher') {
  console.error('FAIL  setup script must delegate to Graph launcher setup')
  process.exit(1)
}
if (scripts.prepack !== './cli/graph check') {
  console.error('FAIL  prepack must delegate to Graph check')
  process.exit(1)
}
for (const forbidden of ['preinstall', 'install', 'postinstall', 'prepare']) {
  if (forbidden in scripts) {
    console.error(`FAIL  ${forbidden} must not install the repository launcher for package consumers`)
    process.exit(1)
  }
}
if (pkg.bin?.graph !== './cli/graph' || Object.keys(pkg.bin).length !== 1) {
  console.error('FAIL  package must expose exactly one graph binary')
  process.exit(1)
}
console.log('PASS  source install provisions Graph while consumer lifecycle hooks stay clean')
NODE

if grep -F '# managed-by: sinapsi-graph' cli/src/commands/setup-launcher.sh >/dev/null 2>&1; then
  pass 'launcher uses the Sinapsi-managed marker'
else
  fail 'launcher marker is not Sinapsi-specific'
fi

if grep -E 'pnpm exec[[:space:]]+graph|npm exec --[[:space:]]+graph' README.md cli/readme.md >/dev/null 2>&1; then
  fail 'active documentation requires a package-manager executable runner for Graph'
else
  pass 'active documentation uses direct graph commands'
fi

if grep -F '.agents' cli/src/commands/cleanup.sh >/dev/null 2>&1 && grep -F '.audits' cli/src/commands/cleanup.sh >/dev/null 2>&1; then
  pass 'cleanup protects harness directories'
else
  fail 'cleanup does not explicitly protect harness directories'
fi

if grep -F "GRAPH_COLOR_NEON_CYAN" cli/src/core/output.sh >/dev/null 2>&1 && \
   grep -F "GRAPH_COLOR_NEON_MAGENTA" cli/src/core/output.sh >/dev/null 2>&1 && \
   grep -F "GRAPH_COLOR_NEON_BLUE" cli/src/core/output.sh >/dev/null 2>&1; then
  pass 'terminal GRAPH logo defines neon cyan, magenta, and blue colors'
else
  fail 'terminal GRAPH logo is missing neon color channels'
fi

graph_tmp=${TMPDIR:-/tmp}/graph-cli-audit.$$
trap 'rm -rf "$graph_tmp"' 0 1 2 15
mkdir -p "$graph_tmp/bin" "$graph_tmp/package/cli" "$graph_tmp/project" "$graph_tmp/direct-bin"
ln -s "$ROOT/cli/graph" "$graph_tmp/bin/graph"
if "$graph_tmp/bin/graph" --version | grep -Fx "graph $(node -p "require('./package.json').version")" >/dev/null 2>&1; then
  pass 'package-manager style symlink resolves the real CLI location'
else
  fail 'CLI entry point fails through a symlink'
fi

if GRAPH_BIN_DIR="$graph_tmp/direct-bin" CI= ./cli/graph setup --launcher --bootstrap >/dev/null 2>&1 &&
   PATH="$graph_tmp/direct-bin:$PATH" graph --version | grep -Fx "graph $(node -p "require('./package.json').version")" >/dev/null 2>&1; then
  pass 'managed launcher exposes graph directly on PATH'
else
  fail 'managed launcher does not expose a direct graph command'
fi

cp package.json "$graph_tmp/package/package.json"
cp -R cli "$graph_tmp/package/"
cat > "$graph_tmp/project/package.json" <<'JSON'
{
  "name": "graph-consumer-audit",
  "private": true,
  "packageManager": "pnpm@12.4.2"
}
JSON
if (cd "$graph_tmp/project" && "$graph_tmp/package/cli/graph" --dry-run) | grep -F 'pnpm add sinapsi@' >/dev/null 2>&1; then
  pass 'published CLI routes directly to project setup and detects pnpm'
else
  fail 'published CLI does not select project setup correctly'
fi

cat > "$graph_tmp/project/package.json" <<'JSON'
{
  "name": "graph-consumer-audit",
  "private": true,
  "dependencies": {
    "sinapsi": "^0.1.0"
  }
}
JSON
before=$(find "$graph_tmp/project" -type f -exec basename {} \; | LC_ALL=C sort)
if (cd "$graph_tmp/project" && "$graph_tmp/package/cli/graph") >/dev/null 2>&1; then
  after=$(find "$graph_tmp/project" -type f -exec basename {} \; | LC_ALL=C sort)
  if [ "$before" = "$after" ]; then
    pass 'default published setup is idempotent and creates no source files'
  else
    fail 'default published setup created unexpected project files'
  fi
else
  fail 'default published setup fails for an existing dependency'
fi

graph_history="$graph_tmp/history"
mkdir -p "$graph_history/.agents" "$graph_history/.audits" "$graph_history/src"
cp -R cli "$graph_history/"
cp package.json commitlint.config.cjs "$graph_history/"
touch "$graph_history/tsdown.config.ts"
ln -s "$ROOT/node_modules" "$graph_history/node_modules"
git -C "$graph_history" init -q
graph_tree=$(git -C "$graph_history" mktree </dev/null)
graph_fixture_commit() {
  GIT_AUTHOR_NAME='Jonatas Sales' GIT_AUTHOR_EMAIL='sykes.echo@proton.me' \
  GIT_COMMITTER_NAME='Jonatas Sales' GIT_COMMITTER_EMAIL='sykes.echo@proton.me' \
    git -C "$graph_history" commit-tree "$graph_tree" "$@"
}
graph_base=$(printf 'chore: initial fixture\n' | graph_fixture_commit)
graph_valid=$(printf 'fix: valid introduced change\n' | graph_fixture_commit -p "$graph_base")
graph_long_body=$(printf '%0110d' 0)
graph_invalid=$(printf "Merge branch 'fixture'\n\n%s\n" "$graph_long_body" | graph_fixture_commit -p "$graph_base")
graph_good_merge=$(printf 'docs: merge valid branch\n\n%s\n' "$graph_long_body" | graph_fixture_commit -p "$graph_base" -p "$graph_valid")
graph_bad_merge=$(printf 'docs: merge invalid branch\n' | graph_fixture_commit -p "$graph_base" -p "$graph_invalid")
for graph_history_command in lint commits; do
  git -C "$graph_history" update-ref HEAD "$graph_invalid"
  if "$graph_history/cli/graph" git "$graph_history_command" --last >"$graph_tmp/history.log" 2>&1; then
    fail "$graph_history_command accepts a non-merge with an invalid body"
  elif grep -F 'body-max-line-length' "$graph_tmp/history.log" >/dev/null 2>&1; then
    pass "$graph_history_command strictly checks a merge-looking non-merge"
  else
    fail "$graph_history_command failed for an unexpected reason"
  fi
  git -C "$graph_history" update-ref HEAD "$graph_good_merge"
  for graph_history_mode in last range; do
    if [ "$graph_history_mode" = last ]; then
      set -- --last
    else
      set -- --from "$graph_base" --to HEAD
    fi
    if "$graph_history/cli/graph" git "$graph_history_command" "$@" >"$graph_tmp/history.log" 2>&1; then
      pass "$graph_history_command $graph_history_mode accepts an integration envelope with valid changes"
    else
      fail "$graph_history_command $graph_history_mode rejects a valid introduced history"
      cat "$graph_tmp/history.log" >&2
    fi
  done
  git -C "$graph_history" update-ref HEAD "$graph_bad_merge"
  for graph_history_mode in last range; do
    if [ "$graph_history_mode" = last ]; then
      set -- --last
    else
      set -- --from "$graph_base" --to HEAD
    fi
    if "$graph_history/cli/graph" git "$graph_history_command" "$@" >"$graph_tmp/history.log" 2>&1; then
      fail "$graph_history_command $graph_history_mode hides an invalid introduced commit"
    elif grep -F 'body-max-line-length' "$graph_tmp/history.log" >/dev/null 2>&1; then
      pass "$graph_history_command $graph_history_mode rejects invalid introduced history"
    else
      fail "$graph_history_command $graph_history_mode failed for an unexpected reason"
    fi
  done
done

if [ "$failures" -ne 0 ]; then
  printf '\n%d CLI audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nCLI audit passed.\n'
