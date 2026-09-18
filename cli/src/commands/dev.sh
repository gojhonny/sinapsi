#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Dev help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage: graph dev [vite arguments]

Serve the interactive <sinap-si> sandbox from sandbox/ with Vite.
USAGE
    exit 0
    ;;
esac

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
exec pnpm exec vite sandbox --config vite.config.ts "$@"
