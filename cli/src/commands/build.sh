#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Build help does not accept additional arguments.' 2
    printf 'Usage: graph build\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Build does not accept arguments.' 2 ;;
  *) graph_die "Unknown build option: $1" 2 ;;
esac

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
graph_print_info 'Building package entry points'
pnpm exec tsdown
graph_print_info 'Building standalone browser entry point'
exec pnpm exec tsdown --config tsdown.standalone.config.ts
