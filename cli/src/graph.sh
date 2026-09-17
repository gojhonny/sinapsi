#!/bin/sh
set -eu

CLI_DIR=$(CDPATH= cd -P "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -P "$CLI_DIR/../.." && pwd)

export GRAPH_CLI_DIR="$CLI_DIR"
export GRAPH_PROJECT_ROOT="$PROJECT_ROOT"

. "$CLI_DIR/core/common.sh"

graph_usage_error() {
  graph_print_error "Graph: $1"
  printf "Run 'graph help' for usage.\n" >&2
  exit 2
}

graph_default_command() {
  if graph_is_repository_source; then
    printf 'help\n'
  else
    printf 'setup\n'
  fi
}

while [ "${1:-}" = --logs ]; do
  GRAPH_LOGS=true
  export GRAPH_LOGS
  shift
done

if [ "$#" -eq 0 ]; then
  graph_command=$(graph_default_command)
else
  graph_command=$1
  shift
fi

while [ "${1:-}" = --logs ]; do
  GRAPH_LOGS=true
  export GRAPH_LOGS
  shift
done

graph_log "command=$graph_command"
GRAPH_HELP_TOPIC=$graph_command
export GRAPH_HELP_TOPIC

case "$graph_command" in
  help|--help|-h)
    exec "$CLI_DIR/commands/help.sh" "$@"
    ;;
  version|--version|-V)
    if [ "$#" -eq 1 ] && { [ "$1" = --help ] || [ "$1" = -h ]; }; then
      printf 'Usage: graph version | --version | -V\n'
      exit 0
    fi
    [ "$#" -eq 0 ] || graph_usage_error 'Version does not accept arguments.'
    graph_version=$(graph_project_version 2>/dev/null || true)
    [ -n "$graph_version" ] || graph_die 'Unable to read the Sinapsi version.'
    printf 'graph %s\n' "$graph_version"
    ;;
  setup)
    exec "$CLI_DIR/commands/setup.sh" "$@"
    ;;
  --project|--package-manager|--package-spec|--force|--dry-run)
    graph_is_repository_source && graph_usage_error "Unknown option: $graph_command"
    exec "$CLI_DIR/commands/setup.sh" "$graph_command" "$@"
    ;;
  bootstrap|install)
    graph_require_repository_source
    exec "$CLI_DIR/commands/bootstrap.sh" "$@"
    ;;
  doctor)
    graph_require_repository_source
    exec "$CLI_DIR/commands/doctor.sh" "$@"
    ;;
  cleanup|clean)
    graph_require_repository_source
    exec "$CLI_DIR/commands/cleanup.sh" "$@"
    ;;
  lint)
    graph_require_repository_source
    exec "$CLI_DIR/commands/lint.sh" "$@"
    ;;
  typecheck)
    graph_require_repository_source
    exec "$CLI_DIR/commands/typecheck.sh" "$@"
    ;;
  test)
    graph_require_repository_source
    exec "$CLI_DIR/commands/test.sh" "$@"
    ;;
  dev)
    graph_require_repository_source
    exec "$CLI_DIR/commands/dev.sh" "$@"
    ;;
  build)
    graph_require_repository_source
    exec "$CLI_DIR/commands/build.sh" "$@"
    ;;
  harness|neon)
    graph_require_repository_source
    exec "$CLI_DIR/commands/harness.sh" "$@"
    ;;
  audit)
    graph_require_repository_source
    exec "$CLI_DIR/commands/audit.sh" "$@"
    ;;
  check)
    graph_require_repository_source
    exec "$CLI_DIR/commands/check.sh" "$@"
    ;;
  git)
    graph_require_repository_source
    graph_subcommand=${1:-}
    if [ "$#" -gt 0 ]; then
      shift
    fi
    while [ "${1:-}" = --logs ]; do
      GRAPH_LOGS=true
      export GRAPH_LOGS
      shift
    done
    graph_log "git subcommand=$graph_subcommand"
    GRAPH_HELP_TOPIC="git${graph_subcommand:+ $graph_subcommand}"
    case "$graph_subcommand" in
      ''|help|--help|-h) exec "$CLI_DIR/commands/help.sh" git "$@" ;;
      setup) exec "$CLI_DIR/commands/git-setup.sh" "$@" ;;
      doctor) exec "$CLI_DIR/commands/git-doctor.sh" "$@" ;;
      pre-commit) exec "$CLI_DIR/commands/git-pre-commit.sh" "$@" ;;
      commit-message|commit-msg) exec "$CLI_DIR/commands/git-commit-msg.sh" "$@" ;;
      lint) exec "$CLI_DIR/commands/git-lint.sh" "$@" ;;
      commits) exec "$CLI_DIR/commands/git-commits.sh" "$@" ;;
      commit)
        case "${1:-}" in
          ''|help|--help|-h) exec "$CLI_DIR/commands/help.sh" git commit "$@" ;;
          message) ;;
          *) graph_usage_error 'Usage: graph git commit message <message-file>' ;;
        esac
        shift
        GRAPH_HELP_TOPIC='git commit-message'
        while [ "${1:-}" = --logs ]; do
          GRAPH_LOGS=true
          export GRAPH_LOGS
          shift
        done
        exec "$CLI_DIR/commands/git-commit-msg.sh" "$@"
        ;;
      version-check) exec "$CLI_DIR/commands/git-version-check.sh" "$@" ;;
      *) graph_usage_error 'Usage: graph git <setup|doctor|pre-commit|commit-message|lint|commits|version-check>' ;;
    esac
    ;;
  --*) graph_usage_error "Unknown option: $graph_command" ;;
  *) graph_usage_error "Unknown command: $graph_command" ;;
esac
