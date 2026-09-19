#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

if [ "$#" -gt 0 ]; then
  graph_help_command=$1
  shift
  case "$graph_help_command" in
    git)
      graph_require_repository_source
      graph_help_subcommand=${1:-}
      [ "$#" -eq 0 ] || shift
      case "$graph_help_subcommand" in
        ''|help|--help|-h)
          [ "$#" -eq 0 ] || graph_die 'Usage: graph help git [subcommand]' 2
          cat <<'EOF_GIT'
Usage: graph git [--logs] <command> [--logs] [arguments]

Commands:
  setup                         Install Husky hook adapters
  doctor [--ci]                 Diagnose repository Git tooling
  pre-commit                    Run staged-file and SemVer gates
  commit-message <file>         Validate a Conventional Commit message
  lint --last                   Validate the latest commit
  lint --from <rev> --to <rev>   Validate a commit range
  version-check [--staged]      Validate package semantic versioning

Aliases:
  commit-msg <file>, commit message <file>  Same as commit-message
  commits [arguments]                      Same commit-history validation as lint

Run 'graph help git <command>' or 'graph git <command> --help' for details.
EOF_GIT
          exit 0
          ;;
        commit)
          case "${1:-}" in
            message|help|--help|-h) shift ;;
          esac
          [ "$#" -eq 0 ] || graph_die 'Usage: graph help git commit [message]' 2
          printf 'Usage: graph git commit message <message-file>\n'
          exit 0
          ;;
        setup|doctor|pre-commit|commit-message|commit-msg|lint|commits|version-check)
          [ "$#" -eq 0 ] || graph_die "Usage: graph help git $graph_help_subcommand" 2
          exec "$GRAPH_CLI_DIR/graph.sh" git "$graph_help_subcommand" --help
          ;;
        *) graph_die "Unknown git help topic: $graph_help_subcommand. Run 'graph help git'." 2 ;;
      esac
      ;;
    bootstrap|install|setup|doctor|cleanup|clean|lint|typecheck|test|dev|build|harness|neon|audit|check|version|--version|-V)
      [ "$#" -eq 0 ] || graph_die "Usage: graph help $graph_help_command" 2
      exec "$GRAPH_CLI_DIR/graph.sh" "$graph_help_command" --help
      ;;
    help|--help|-h)
      [ "$#" -eq 0 ] || graph_die 'Usage: graph help [command]' 2
      ;;
    *) graph_die "Unknown help topic: $graph_help_command. Run 'graph help'." 2 ;;
  esac
fi

graph_print_logo

if ! graph_is_repository_source; then
  cat <<'EOF_PUBLIC'
Sinapsi project installer

Usage:
  npx -y --package=sinapsi@latest graph
  graph setup [options]

Options:
  --project <directory>                 Target project; defaults to the current directory
  --package-manager <npm|pnpm|yarn|bun> Override package-manager detection
  --package-spec <specifier>            Override the Sinapsi package/version to install
  --force                               Reinstall even when Sinapsi is already declared
  --dry-run                             Print the installation command without executing it
  --logs                                Print operational diagnostics to stderr
  --help, -h                            Show this guide
  --version, -V                         Print the executing Sinapsi version

The default command is setup. It adds sinapsi to an existing project
and prints the framework-neutral registration snippet. It does not generate or
overwrite application source files.
EOF_PUBLIC
  exit 0
fi

cat <<'EOF_REPOSITORY'
Sinapsi repository engineering CLI

Usage:
  graph [--logs] <command> [arguments]
  ./cli/graph <command> [arguments]
  graph help <command>
  graph help git <command>

Commands:
  help [command]                        Show this guide or command-specific help
  --version                             Print the local Sinapsi/Graph version
  bootstrap                             Install dependencies and configure the checkout
  setup [--launcher] [--bin-dir <dir>]  Install the user-scoped graph launcher
  setup --project <dir> [options]       Install Sinapsi into an existing consumer project
  doctor [--ci]                         Diagnose the Sinapsi engineering environment
  cleanup [options]                     Remove generated state and dependencies
  lint [--write|--staged]               Run Biome or staged-file checks
  typecheck                             Type-check source and colocated tests
  test [--watch|--coverage] [args]      Run Vitest
  dev [vite arguments]                  Serve the interactive sandbox
  build                                 Build package and standalone distributions
  harness [args]                        Run the external engineering harness tool
  audit                                 Run every versioned repository audit
  check                                 Run the complete release quality gate
  git help                              Show the Git command guide
  git setup                             Install Husky hook adapters
  git doctor [--ci]                     Diagnose Commitlint, Husky, and lint-staged
  git pre-commit                        Run staged-file and SemVer gates
  git commit-message <file>             Validate a Conventional Commit message
  git commit message <file>             Alias for git commit-message
  git lint --last                       Validate the latest commit
  git lint --from <rev> --to <rev>      Validate a commit range
  git commits --last                    Backward-compatible commit lint alias
  git version-check [--staged]          Validate package semantic versioning

Aliases:
  install       bootstrap (repository only)
  clean         cleanup
  neon          harness
  version, -V   --version
  git commit-msg <file>  git commit-message <file>

Global flags:
  --help, -h     Show this guide
  --logs         Print operational diagnostics to stderr
  --version, -V  Print the local version

Use --logs before or immediately after a command or Git subcommand.
Use '<command> --help' or 'help <command>' for command-specific options.

First checkout:
  ./cli/graph bootstrap

Install only the user-scoped launcher:
  pnpm run setup

Consumer installation test:
  npx -y --package=sinapsi@latest graph

Graph is implemented entirely with POSIX shell scripts. Package commands are
owned by Graph; package.json keeps only the setup bridge and npm lifecycle gates.
EOF_REPOSITORY
