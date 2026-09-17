#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

mode=run
case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Test help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage:
  graph test [vitest arguments]
  graph test --coverage [vitest arguments]
  graph test --watch [vitest arguments]

The default mode executes Vitest once. Positional arguments after the optional
mode are forwarded to Vitest, so a colocated suite can be targeted directly.
USAGE
    exit 0
    ;;
  --coverage|coverage)
    mode=coverage
    shift
    ;;
  --watch|watch)
    mode=watch
    shift
    ;;
esac

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"

case "$mode" in
  run) exec pnpm exec vitest run "$@" ;;
  coverage) exec pnpm exec vitest run --coverage "$@" ;;
  watch) exec pnpm exec vitest "$@" ;;
esac
