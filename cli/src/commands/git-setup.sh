#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Git setup help does not accept additional arguments.' 2
    printf 'Usage: graph git setup\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Git setup does not accept arguments.' 2 ;;
  *) graph_die "Unknown git setup option: $1" 2 ;;
esac

graph_need git
graph_git_checkout || graph_die 'Git setup must run inside the Sinapsi checkout.'

mkdir -p "$GRAPH_PROJECT_ROOT/.husky"
cat >"$GRAPH_PROJECT_ROOT/.husky/pre-commit" <<'HOOK'
#!/bin/sh
exec ./cli/graph git pre-commit "$@"
HOOK
cat >"$GRAPH_PROJECT_ROOT/.husky/commit-msg" <<'HOOK'
#!/bin/sh
exec ./cli/graph git commit-message "$@"
HOOK
chmod 755 "$GRAPH_PROJECT_ROOT/.husky/pre-commit" "$GRAPH_PROJECT_ROOT/.husky/commit-msg"

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
pnpm exec husky >/dev/null
graph_print_success 'Husky hooks configured for Sinapsi'
