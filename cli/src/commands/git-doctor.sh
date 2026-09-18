#!/bin/sh
set -u
. "$GRAPH_CLI_DIR/core/common.sh"

ci=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ci) ci=true ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Git doctor help does not accept additional arguments.' 2
      printf 'Usage: graph git doctor [--ci]\n'
      exit 0
      ;;
    *) graph_die "Unknown git doctor option: $1" 2 ;;
  esac
  shift
done

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

if graph_has git && graph_git_checkout; then pass 'Git checkout'; else fail 'Git checkout unavailable'; fi

for git_file in commitlint.config.cjs .lintstagedrc.json cli/.husky/pre-commit cli/.husky/commit-msg; do
  if [ -f "$GRAPH_PROJECT_ROOT/$git_file" ]; then pass "$git_file"; else fail "missing $git_file"; fi
done

if [ -x "$GRAPH_PROJECT_ROOT/cli/.husky/pre-commit" ]; then pass 'cli/.husky/pre-commit is executable'; else fail 'cli/.husky/pre-commit is not executable'; fi
if [ -x "$GRAPH_PROJECT_ROOT/cli/.husky/commit-msg" ]; then pass 'cli/.husky/commit-msg is executable'; else fail 'cli/.husky/commit-msg is not executable'; fi

if grep -F 'graph git pre-commit' "$GRAPH_PROJECT_ROOT/cli/.husky/pre-commit" >/dev/null 2>&1; then
  pass 'pre-commit is a thin Graph adapter'
else
  fail 'pre-commit is not a thin Graph adapter'
fi
if grep -F 'graph git commit-message' "$GRAPH_PROJECT_ROOT/cli/.husky/commit-msg" >/dev/null 2>&1; then
  pass 'commit-msg is a thin Graph adapter'
else
  fail 'commit-msg is not a thin Graph adapter'
fi

for git_dependency in @commitlint/cli @commitlint/config-conventional husky lint-staged semver; do
  expected=$(graph_package_dependency_version "$git_dependency" 2>/dev/null || true)
  actual=$(graph_local_package_version "$git_dependency" 2>/dev/null || true)
  if [ -z "$expected" ]; then
    fail "package.json is missing $git_dependency"
  elif [ -z "$actual" ]; then
    fail "$git_dependency is not installed (expected $expected)"
  elif [ "$actual" = "$expected" ]; then
    pass "$git_dependency $actual"
  else
    fail "$git_dependency $actual does not match package.json $expected"
  fi
done

if [ "$ci" = false ] && graph_has git && graph_git_checkout; then
  hooks_path=$(git -C "$GRAPH_PROJECT_ROOT" config --local --get core.hooksPath 2>/dev/null || true)
  if [ "$hooks_path" = cli/.husky/_ ]; then
    pass 'core.hooksPath=cli/.husky/_'
  else
    fail "core.hooksPath is '${hooks_path:-unset}'; run graph git setup"
  fi
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d Git tooling failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nGraph Git doctor PASS\n'
