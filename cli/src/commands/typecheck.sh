#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Typecheck help does not accept additional arguments.' 2
    printf 'Usage: graph typecheck\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Typecheck does not accept arguments.' 2 ;;
  *) graph_die "Unknown typecheck option: $1" 2 ;;
esac

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
graph_print_info 'Type-checking package source'
pnpm exec tsc --noEmit
graph_print_info 'Type-checking colocated tests'
exec pnpm exec tsc -p tsconfig.test.json --noEmit
