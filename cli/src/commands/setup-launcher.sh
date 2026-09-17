#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

graph_require_repository_source

graph_setup_mode=manual
graph_bin_dir=${GRAPH_BIN_DIR:-}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --bin-dir)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--bin-dir requires a directory' 2
      graph_bin_dir=$1
      ;;
    --bootstrap)
      graph_setup_mode=bootstrap
      ;;
    --launcher)
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Launcher setup help does not accept additional arguments.' 2
      cat <<'EOF'
Usage:
  graph setup [--launcher] [--bin-dir <directory>]

Destination precedence:
  --bin-dir, GRAPH_BIN_DIR, PNPM_HOME, XDG_BIN_HOME, ~/.local/bin

Set GRAPH_SETUP_DISABLED=1 to skip launcher installation. Graph never edits a
shell profile and never replaces an unmanaged file or symlink.
EOF
      exit 0
      ;;
    *) graph_die "Unknown setup option: $1" 2 ;;
  esac
  shift
done

case "${GRAPH_SETUP_DISABLED:-0}" in
  1|true|TRUE|yes|YES)
    printf 'Graph launcher setup skipped: GRAPH_SETUP_DISABLED is set.\n'
    exit 0
    ;;
esac

if [ "$graph_setup_mode" = bootstrap ] && graph_ci_enabled; then
  printf 'Graph launcher setup skipped in CI.\n'
  exit 0
fi

if [ -z "$graph_bin_dir" ]; then
  graph_bin_dir=$(graph_default_bin_dir 2>/dev/null || true)
fi
[ -n "$graph_bin_dir" ] || graph_die 'No user binary directory is available. Set GRAPH_BIN_DIR or HOME.'

mkdir -p "$graph_bin_dir" || graph_die "Cannot create binary directory: $graph_bin_dir"
graph_bin_dir=$(CDPATH= cd -P "$graph_bin_dir" && pwd)
[ -w "$graph_bin_dir" ] || graph_die "Binary directory is not writable: $graph_bin_dir"

graph_target="$graph_bin_dir/graph"
if [ -L "$graph_target" ]; then
  graph_die "Refusing to replace symlink: $graph_target"
elif [ -e "$graph_target" ]; then
  [ -f "$graph_target" ] || graph_die "Refusing to replace non-regular path: $graph_target"
  graph_marker=$(sed -n '2p' "$graph_target" 2>/dev/null || true)
  [ "$graph_marker" = '# managed-by: sinapsi-graph' ] ||
    [ "$graph_marker" = '# managed-by: graphz-graph' ] ||
    graph_die "Unmanaged command already exists: $graph_target"
fi

graph_tmp_dir=
graph_tmp=
graph_setup_cleanup() {
  [ -z "$graph_tmp" ] || rm -f "$graph_tmp"
  [ -z "$graph_tmp_dir" ] || rmdir "$graph_tmp_dir" 2>/dev/null || :
}
graph_setup_on_signal() {
  trap - 0 1 2 15
  graph_setup_cleanup
  exit 1
}
trap graph_setup_cleanup 0
trap graph_setup_on_signal 1 2 15

graph_tmp_attempt=0
while [ "$graph_tmp_attempt" -lt 100 ]; do
  graph_tmp_attempt=$((graph_tmp_attempt + 1))
  graph_tmp_candidate="$graph_bin_dir/.graph.tmp.$$.$graph_tmp_attempt"
  if (umask 077 && mkdir "$graph_tmp_candidate") 2>/dev/null; then
    graph_tmp_dir=$graph_tmp_candidate
    break
  fi
done
[ -n "$graph_tmp_dir" ] || graph_die "Cannot reserve temporary directory in $graph_bin_dir"
graph_tmp="$graph_tmp_dir/graph"

graph_fallback_root=$(graph_shell_quote "$GRAPH_PROJECT_ROOT")
{
  cat <<'EOF'
#!/bin/sh
# managed-by: sinapsi-graph
set -eu

EOF
  printf 'fallback_root=%s\n' "$graph_fallback_root"
  cat <<'EOF'

if [ ! -x "$fallback_root/cli/graph" ]; then
  printf 'graph: configured Sinapsi checkout is unavailable: %s\n' "$fallback_root" >&2
  printf 'graph: run ./cli/graph setup from a valid checkout\n' >&2
  exit 2
fi

exec "$fallback_root/cli/graph" "$@"
EOF
} >"$graph_tmp"
chmod 755 "$graph_tmp"

if [ -x "$graph_target" ] && cmp -s "$graph_tmp" "$graph_target"; then
  printf 'Graph launcher already configured at %s\n' "$graph_target"
  exit 0
fi

mv "$graph_tmp" "$graph_target"
graph_tmp=
rmdir "$graph_tmp_dir"
graph_tmp_dir=
trap - 0 1 2 15

printf 'Graph launcher installed at %s\n' "$graph_target"
if ! graph_path_contains "$graph_bin_dir"; then
  graph_warn "$graph_bin_dir is not on PATH"
fi
