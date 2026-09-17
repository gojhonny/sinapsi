#!/bin/sh
set -u
. "$GRAPH_CLI_DIR/core/common.sh"

ci=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ci) ci=true ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Doctor help does not accept additional arguments.' 2
      printf 'Usage: graph doctor [--ci]\n'
      exit 0
      ;;
    *) graph_die "Unknown doctor option: $1" 2 ;;
  esac
  shift
done

failures=0
pass() {
  doctor_detail=${2:+ — $2}
  printf '%sPASS  %s%s%s\n' "$GRAPH_COLOR_GREEN" "$1" "$doctor_detail" "$GRAPH_COLOR_RESET"
}
warn() {
  doctor_detail=${2:+ — $2}
  printf '%sWARN  %s%s%s\n' "$GRAPH_COLOR_YELLOW" "$1" "$doctor_detail" "$GRAPH_COLOR_RESET"
}
fail() {
  doctor_detail=${2:+ — $2}
  printf '%sFAIL  %s%s%s\n' "$GRAPH_COLOR_RED" "$1" "$doctor_detail" "$GRAPH_COLOR_RESET" >&2
  [ -z "${3:-}" ] || printf '      fix: %s\n' "$3" >&2
  failures=$((failures + 1))
}

graph_print_logo
printf 'Sinapsi engineering doctor\n'

if graph_has node; then
  node_version=$(node --version 2>/dev/null || true)
  node_major=$(printf '%s' "$node_version" | sed 's/^v\([0-9][0-9]*\).*/\1/')
  if [ "$node_major" -ge 24 ] 2>/dev/null; then pass node "$node_version"; else fail node "$node_version" 'Install Node.js 24 or later from .nvmrc.'; fi
else
  fail node 'not available' 'Install Node.js 24 or later.'
fi

expected_pnpm=$(graph_package_value packageManager 2>/dev/null | sed 's/^pnpm@//' || true)
if graph_has pnpm; then
  actual_pnpm=$(pnpm --version 2>/dev/null || true)
  if [ "$actual_pnpm" = "$expected_pnpm" ]; then pass pnpm "$actual_pnpm"; else fail pnpm "$actual_pnpm (expected $expected_pnpm)" 'Activate the packageManager version.'; fi
else
  fail pnpm 'not available' 'Enable Corepack and activate pnpm.'
fi

if graph_has git; then pass git "$(git --version 2>/dev/null || true)"; else fail git 'not available' 'Install Git.'; fi

for required_file in package.json pnpm-lock.yaml biome.json tsconfig.json tsconfig.test.json vitest.config.ts commitlint.config.cjs .lintstagedrc.json cli/graph; do
  if [ -f "$GRAPH_PROJECT_ROOT/$required_file" ]; then pass "$required_file"; else fail "$required_file" missing 'Restore the repository configuration.'; fi
done

if [ -d "$GRAPH_PROJECT_ROOT/node_modules" ]; then
  pass install-state node_modules
else
  fail install-state missing 'Run pnpm install --no-frozen-lockfile.'
fi

for dependency in typescript @biomejs/biome tsdown vitest happy-dom @vitest/coverage-v8 @commitlint/cli @commitlint/config-conventional husky lint-staged semver; do
  expected=$(graph_package_dependency_version "$dependency" 2>/dev/null || true)
  actual=$(graph_local_package_version "$dependency" 2>/dev/null || true)
  if [ -z "$expected" ]; then
    fail "$dependency" 'not declared' 'Add it to package.json devDependencies.'
  elif [ -z "$actual" ]; then
    fail "$dependency" "not installed (expected $expected)" 'Run pnpm install --no-frozen-lockfile.'
  elif [ "$actual" = "$expected" ]; then
    pass "$dependency" "$actual"
  else
    fail "$dependency" "$actual (expected $expected)" 'Reinstall the dependency graph.'
  fi
done

audit_count=0
for audit_file in "$GRAPH_PROJECT_ROOT"/.audits/*.audit.sh; do
  [ -f "$audit_file" ] || continue
  audit_count=$((audit_count + 1))
  if /bin/sh -n "$audit_file"; then pass "$(graph_rel "$audit_file")"; else fail "$(graph_rel "$audit_file")" 'invalid shell syntax'; fi
done
[ "$audit_count" -gt 0 ] || fail audits missing 'Restore .audits/*.audit.sh.'

if [ "$ci" = true ]; then
  if "$GRAPH_CLI_DIR/commands/git-doctor.sh" --ci >/dev/null 2>&1; then pass git-tooling 'CI configuration'; else fail git-tooling 'invalid CI configuration' 'Run graph git doctor --ci.'; fi
else
  if "$GRAPH_CLI_DIR/commands/git-doctor.sh" >/dev/null 2>&1; then pass git-tooling configured; else fail git-tooling 'not configured' 'Run graph git setup, then graph git doctor.'; fi

  direct_bin=$(graph_default_bin_dir 2>/dev/null || true)
  if [ -n "$direct_bin" ] && [ -x "$direct_bin/graph" ]; then
    launcher_marker=$(sed -n '2p' "$direct_bin/graph" 2>/dev/null || true)
    if [ "$launcher_marker" = '# managed-by: sinapsi-graph' ] ||
      [ "$launcher_marker" = '# managed-by: graphz-graph' ]; then
      pass direct-graph "$direct_bin/graph"
    else
      warn direct-graph 'not configured; run pnpm install or ./cli/graph setup --launcher'
    fi
  else
    warn direct-graph 'not configured; run pnpm install or ./cli/graph setup --launcher'
  fi
fi

if [ "$failures" -gt 0 ]; then
  graph_print_error "Graph doctor FAIL — $failures required check(s) failed"
  exit 1
fi
graph_print_success 'Graph doctor PASS'
