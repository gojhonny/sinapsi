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

hooks_dir="$GRAPH_PROJECT_ROOT/cli/.husky"
mkdir -p "$hooks_dir"
cat >"$hooks_dir/pre-commit" <<'HOOK'
#!/bin/sh
exec ./cli/graph git pre-commit "$@"
HOOK
cat >"$hooks_dir/commit-msg" <<'HOOK'
#!/bin/sh
exec ./cli/graph git commit-message "$@"
HOOK
chmod 755 "$hooks_dir/pre-commit" "$hooks_dir/commit-msg"

if [ -e "$GRAPH_PROJECT_ROOT/.husky" ]; then
  rm -rf "$GRAPH_PROJECT_ROOT/.husky"
fi

graph_need pnpm
cd "$GRAPH_PROJECT_ROOT"
pnpm exec husky cli/.husky >/dev/null
graph_print_success 'Husky hooks configured for Sinapsi'
