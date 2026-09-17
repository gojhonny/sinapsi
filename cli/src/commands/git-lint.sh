#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

graph_lint_mode=
graph_from=
graph_to=

while [ "$#" -gt 0 ]; do
  case "$1" in
    --last)
      [ -z "$graph_lint_mode" ] || graph_die 'Choose either --last or --from/--to.' 2
      graph_lint_mode=last
      ;;
    --from)
      graph_require_option_value "$1" "${2:-}"
      [ "$graph_lint_mode" != last ] || graph_die 'Choose either --last or --from/--to.' 2
      shift
      [ "$#" -gt 0 ] || graph_die '--from requires a Git revision.' 2
      graph_from=$1
      graph_lint_mode=range
      ;;
    --to)
      graph_require_option_value "$1" "${2:-}"
      [ "$graph_lint_mode" != last ] || graph_die 'Choose either --last or --from/--to.' 2
      shift
      [ "$#" -gt 0 ] || graph_die '--to requires a Git revision.' 2
      graph_to=$1
      graph_lint_mode=range
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Git lint help does not accept additional arguments.' 2
      cat <<'HELP'
Usage:
  graph git lint --last
  graph git lint --from <revision> --to <revision>

Validate non-merge commits. For a merge HEAD, --last validates the changes
introduced relative to its first parent; merge envelopes are not linted.
HELP
      exit 0
      ;;
    *) graph_die "Unknown git lint option: $1" 2 ;;
  esac
  shift
done

[ -n "$graph_lint_mode" ] || graph_die 'Git lint requires --last or --from/--to.' 2
graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"

case "$graph_lint_mode" in
  last) graph_lint_commit_history last ;;
  range)
    [ -n "$graph_from" ] && [ -n "$graph_to" ] || graph_die 'Git lint range requires both --from and --to.' 2
    graph_lint_commit_history range "$graph_from" "$graph_to"
    ;;
esac
