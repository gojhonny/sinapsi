#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Pre-commit help does not accept additional arguments.' 2
    printf 'Usage: graph git pre-commit\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Git pre-commit does not accept arguments.' 2 ;;
  *) graph_die "Unknown pre-commit option: $1" 2 ;;
esac

graph_need pnpm
graph_need git
graph_git_checkout || graph_die 'Git pre-commit must run inside the Sinapsi checkout.'

cd "$GRAPH_PROJECT_ROOT"
"$GRAPH_CLI_DIR/commands/git-version-check.sh" --staged
exec "$GRAPH_CLI_DIR/commands/lint.sh" --staged
