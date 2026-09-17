#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"
graph_require_repository_source

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Check help does not accept additional arguments.' 2
    cat <<'HELP'
Usage: graph check

Runs lint, source/test type checks, Vitest, both package builds, semantic-version
validation, and all versioned repository audits.
HELP
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Check does not accept arguments.' 2 ;;
  *) graph_die "Unknown check option: $1" 2 ;;
esac

graph_run_gate() {
  graph_gate_name=$1
  shift
  printf '\n==> %s\n' "$graph_gate_name"
  "$@"
}

graph_run_gate lint "$GRAPH_CLI_DIR/commands/lint.sh"
graph_run_gate typecheck "$GRAPH_CLI_DIR/commands/typecheck.sh"
graph_run_gate test "$GRAPH_CLI_DIR/commands/test.sh"
graph_run_gate build "$GRAPH_CLI_DIR/commands/build.sh"
graph_run_gate version "$GRAPH_CLI_DIR/commands/git-version-check.sh"
graph_run_gate audits "$GRAPH_CLI_DIR/commands/audit.sh"

printf '\n'
graph_print_success 'Graph check passed'
