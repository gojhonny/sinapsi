#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Commit-message help does not accept additional arguments.' 2
    printf 'Usage: graph git commit-message <message-file>\n'
    exit 0
    ;;
esac

[ "$#" -eq 1 ] || graph_die 'Usage: graph git commit-message <message-file>' 2
message_file=$1
[ -f "$message_file" ] || graph_die "Commit message file does not exist: $message_file" 2

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
exec pnpm exec commitlint --edit "$message_file" --verbose
