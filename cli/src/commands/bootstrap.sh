#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Bootstrap help does not accept additional arguments.' 2
    printf 'Usage: graph bootstrap\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Bootstrap does not accept arguments.' 2 ;;
  *) graph_die "Unknown bootstrap option: $1" 2 ;;
esac

graph_need node
graph_need pnpm
graph_need git

node_major=$(node -p "process.versions.node.split('.')[0]")
[ "$node_major" -ge 24 ] 2>/dev/null || graph_die "Node.js 24 or later is required; found $(node --version)."

cd "$GRAPH_PROJECT_ROOT"
graph_print_info 'Installing the Sinapsi dependency graph'
pnpm install --no-frozen-lockfile

if graph_ci_enabled; then
  graph_print_info 'Skipping Git hook activation and the user-scoped launcher in CI'
  exec "$GRAPH_CLI_DIR/commands/doctor.sh" --ci
fi

graph_print_info 'Configuring repository Git hooks'
"$GRAPH_CLI_DIR/commands/git-setup.sh"

graph_print_info 'Configuring the user-scoped graph launcher'
"$GRAPH_CLI_DIR/commands/setup.sh" --bootstrap

exec "$GRAPH_CLI_DIR/commands/doctor.sh"
