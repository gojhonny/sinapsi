#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

mode=lint
case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Lint help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage:
  graph lint
  graph lint --write
  graph lint --staged

Modes:
  default    Run the repository Biome linter without modifying files
  --write    Run Biome checks and apply safe formatting/lint fixes
  --staged   Run lint-staged against the Git index
USAGE
    exit 0
    ;;
  --write) mode=write ;;
  --staged) mode=staged ;;
  '') [ "$#" -eq 0 ] || graph_die 'Lint does not accept an empty mode.' 2 ;;
  *) graph_die "Unknown lint option: $1" 2 ;;
esac

[ "$#" -le 1 ] || graph_die 'Lint accepts at most one mode option.' 2
graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"

case "$mode" in
  lint) exec pnpm exec biome lint . ;;
  write) exec pnpm exec biome check --write --no-errors-on-unmatched . ;;
  staged) exec pnpm exec lint-staged --relative ;;
esac
