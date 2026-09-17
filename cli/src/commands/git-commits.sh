#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

mode=
from_ref=
to_ref=

while [ "$#" -gt 0 ]; do
  case "$1" in
    --last)
      [ -z "$mode" ] || graph_die 'Choose either --last or --from/--to.' 2
      mode=last
      ;;
    --from)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--from requires a Git reference.' 2
      [ -z "$mode" ] || [ "$mode" = range ] || graph_die 'Choose either --last or --from/--to.' 2
      mode=range
      from_ref=$1
      ;;
    --to)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--to requires a Git reference.' 2
      [ -z "$mode" ] || [ "$mode" = range ] || graph_die 'Choose either --last or --from/--to.' 2
      mode=range
      to_ref=$1
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Git commits help does not accept additional arguments.' 2
      cat <<'USAGE'
Usage:
  graph git commits --last
  graph git commits --from <ref> --to <ref>

Validate non-merge history using Commitlint and the repository Conventional
Commits policy. For a merge HEAD, --last validates the changes introduced
relative to its first parent; merge envelopes are not linted.
USAGE
      exit 0
      ;;
    *) graph_die "Unknown git commits option: $1" 2 ;;
  esac
  shift
done

graph_need pnpm
graph_need git
graph_git_checkout || graph_die 'Commit history validation must run inside the Sinapsi checkout.'
cd "$GRAPH_PROJECT_ROOT"

case "$mode" in
  last) graph_lint_commit_history last ;;
  range)
    [ -n "$from_ref" ] && [ -n "$to_ref" ] || graph_die 'Both --from and --to are required.' 2
    graph_lint_commit_history range "$from_ref" "$to_ref"
    ;;
  *) graph_die 'Usage: graph git commits --last | --from <ref> --to <ref>' 2 ;;
esac
