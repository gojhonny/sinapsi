#!/bin/sh

: "${GRAPH_PROJECT_ROOT:?GRAPH_PROJECT_ROOT must be set by cli/src/graph.sh}"
: "${GRAPH_CLI_DIR:?GRAPH_CLI_DIR must be set by cli/src/graph.sh}"
: "${GRAPH_INVOCATION_DIR:=$(pwd -P)}"

. "$GRAPH_CLI_DIR/core/output.sh"

graph_die() {
  graph_message=$1
  graph_status=${2:-1}
  graph_print_error "Graph: $graph_message"
  if [ "$graph_status" -eq 2 ] && [ -n "${GRAPH_HELP_TOPIC:-}" ]; then
    printf "Run 'graph help %s' for usage.\n" "$GRAPH_HELP_TOPIC" >&2
  fi
  exit "$graph_status"
}

graph_require_option_value() {
  case "${2:-}" in
    ''|-*) graph_die "$1 requires a value." 2 ;;
  esac
}

graph_warn() {
  graph_print_warning "Graph: $*"
}

graph_has() {
  command -v "$1" >/dev/null 2>&1
}

graph_need() {
  graph_has "$1" || graph_die "Required command not found: $1" 127
}

graph_rel() {
  case "$1" in
    "$GRAPH_PROJECT_ROOT"/*) printf '%s\n' "${1#"$GRAPH_PROJECT_ROOT"/}" ;;
    *) printf '%s\n' "$1" ;;
  esac
}

graph_package_value() {
  graph_key=$1
  node - "$GRAPH_PROJECT_ROOT/package.json" "$graph_key" <<'NODE'
const fs = require('node:fs')
const [file, key] = process.argv.slice(2)
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
let value = data
for (const part of key.split('.')) value = value == null ? undefined : value[part]
if (value == null) process.exit(1)
process.stdout.write(typeof value === 'string' ? value : JSON.stringify(value))
NODE
}

graph_package_dependency_version() {
  graph_package_name=$1
  node - "$GRAPH_PROJECT_ROOT/package.json" "$graph_package_name" <<'NODE'
const fs = require('node:fs')
const [file, name] = process.argv.slice(2)
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const value = data.devDependencies?.[name] ?? data.dependencies?.[name]
if (typeof value !== 'string') process.exit(1)
process.stdout.write(value)
NODE
}

graph_project_version() {
  graph_package_value version
}

graph_local_package_version() {
  graph_package_name=$1
  node - "$GRAPH_PROJECT_ROOT" "$graph_package_name" <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
const [root, name] = process.argv.slice(2)
const file = path.join(root, 'node_modules', ...name.split('/'), 'package.json')
try {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (typeof manifest.version !== 'string') process.exit(1)
  process.stdout.write(manifest.version)
} catch {
  process.exit(1)
}
NODE
}

graph_git_checkout() {
  git -C "$GRAPH_PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

graph_lint_commit_history() {
  graph_need git
  graph_need pnpm
  graph_git_checkout || graph_die 'Commit history validation must run inside the Sinapsi checkout.'
  cd "$GRAPH_PROJECT_ROOT"

  if [ "$1" = last ]; then
    if git rev-parse --verify --quiet 'HEAD^2' >/dev/null; then
      # Validate changes introduced by the merge, not its integration envelope.
      graph_history_commits=$(git rev-list --no-merges 'HEAD^1..HEAD') || return 1
    else
      graph_history_commits=$(git rev-parse --verify HEAD) || return 1
    fi
  else
    git merge-base "$2" "$3" >/dev/null || graph_die 'Commit history requires refs with a shared, available merge base.'
    graph_history_commits=$(git rev-list --no-merges "$2..$3") || return 1
  fi
  # Commitlint's Git reader may ignore arbitrary log flags; filter with Git itself.
  for graph_history_commit in $graph_history_commits; do
    graph_history_message=$(git show -s --format=%B "$graph_history_commit") || return 1
    printf '%s\n' "$graph_history_message" | pnpm exec commitlint --verbose || return "$?"
  done
}

graph_is_repository_source() {
  [ -d "$GRAPH_PROJECT_ROOT/.agents" ] &&
    [ -d "$GRAPH_PROJECT_ROOT/.audits" ] &&
    [ -d "$GRAPH_PROJECT_ROOT/src" ] &&
    [ -f "$GRAPH_PROJECT_ROOT/tsdown.config.ts" ]
}

graph_require_repository_source() {
  graph_is_repository_source ||
    graph_die 'This command is available only from a Sinapsi source checkout.' 2
}

graph_default_bin_dir() {
  if [ -n "${GRAPH_BIN_DIR:-}" ]; then
    printf '%s\n' "$GRAPH_BIN_DIR"
  elif [ -n "${PNPM_HOME:-}" ]; then
    printf '%s\n' "$PNPM_HOME"
  elif [ -n "${XDG_BIN_HOME:-}" ]; then
    printf '%s\n' "$XDG_BIN_HOME"
  elif [ -n "${HOME:-}" ]; then
    printf '%s\n' "$HOME/.local/bin"
  else
    return 1
  fi
}

graph_path_contains() (
  graph_path_wanted=$1
  graph_path_rest=${PATH:-}

  while :; do
    case "$graph_path_rest" in
      *:*)
        graph_path_entry=${graph_path_rest%%:*}
        graph_path_rest=${graph_path_rest#*:}
        ;;
      *)
        graph_path_entry=$graph_path_rest
        graph_path_rest=
        ;;
    esac

    [ "$graph_path_entry" = "$graph_path_wanted" ] && return 0
    [ -n "$graph_path_rest" ] || return 1
  done
)

graph_shell_quote() {
  printf "'"
  printf '%s' "$1" | sed "s/'/'\\\\''/g"
  printf "'"
}

graph_ci_enabled() {
  case "${CI:-}" in
    ''|0|false|FALSE|no|NO) return 1 ;;
    *) return 0 ;;
  esac
}
