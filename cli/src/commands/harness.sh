#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Harness help does not accept additional arguments.' 2
    cat <<'USAGE'
Usage: graph harness [harness-score arguments]

Run pinned harness-score 1.5.2 explicitly for this checkout. Arguments are
forwarded to the utility. This command is engineering-only and is never
part of the Sinapsi runtime API.
USAGE
    exit 0
    ;;
esac

graph_need npx
cd "$GRAPH_PROJECT_ROOT"
exec npx --yes harness-score@1.5.2 "$@"
