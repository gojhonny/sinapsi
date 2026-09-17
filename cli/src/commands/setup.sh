#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

if [ "$#" -eq 1 ] && { [ "$1" = --help ] || [ "$1" = -h ]; }; then
  if graph_is_repository_source; then
    "$GRAPH_CLI_DIR/commands/setup-launcher.sh" --help
    printf '\n'
  fi
  exec "$GRAPH_CLI_DIR/commands/setup-project.sh" --help
fi

graph_setup_mode=auto
for graph_setup_argument in "$@"; do
  case "$graph_setup_argument" in
    --launcher|--bin-dir|--bootstrap)
      [ "$graph_setup_mode" != project ] || graph_die 'Launcher and project setup options cannot be combined.' 2
      graph_setup_mode=launcher
      ;;
    --project|--package-manager|--package-spec|--force|--dry-run)
      [ "$graph_setup_mode" != launcher ] || graph_die 'Launcher and project setup options cannot be combined.' 2
      graph_setup_mode=project
      ;;
  esac
done

if [ "$graph_setup_mode" = auto ]; then
  if graph_is_repository_source; then
    graph_setup_mode=launcher
  else
    graph_setup_mode=project
  fi
fi

case "$graph_setup_mode" in
  launcher) exec "$GRAPH_CLI_DIR/commands/setup-launcher.sh" "$@" ;;
  project) exec "$GRAPH_CLI_DIR/commands/setup-project.sh" "$@" ;;
  *) graph_die 'Unable to select an Graph setup mode.' ;;
esac
