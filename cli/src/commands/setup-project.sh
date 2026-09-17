#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

graph_target_dir=$GRAPH_INVOCATION_DIR
graph_package_manager=
graph_package_spec=${GRAPH_PACKAGE_SPEC:-}
graph_force=false
graph_dry_run=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --project)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--project requires a directory.' 2
      graph_target_dir=$1
      ;;
    --package-manager)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--package-manager requires npm, pnpm, yarn, or bun.' 2
      graph_package_manager=$1
      ;;
    --package-spec)
      graph_require_option_value "$1" "${2:-}"
      shift
      [ "$#" -gt 0 ] || graph_die '--package-spec requires a package specifier.' 2
      graph_package_spec=$1
      ;;
    --force)
      graph_force=true
      ;;
    --dry-run)
      graph_dry_run=true
      ;;
    --help|-h)
      [ "$#" -eq 1 ] || graph_die 'Project setup help does not accept additional arguments.' 2
      cat <<'HELP'
Usage:
  npx -y --package=@neongate-ai/sinapsi@latest graph
  graph setup [--project <directory>] [--package-manager <manager>]
            [--package-spec <specifier>] [--force] [--dry-run]

Project setup installs @neongate-ai/sinapsi into an existing JavaScript project.
The package manager is selected from package.json#packageManager, lockfiles, or
npm as a fallback. No application source file is generated or overwritten.
HELP
      exit 0
      ;;
    --launcher|--bootstrap|--bin-dir)
      graph_die 'Launcher-only options cannot be used for project setup.' 2
      ;;
    *) graph_die "Unknown project setup option: $1" 2 ;;
  esac
  shift
done

[ -d "$graph_target_dir" ] || graph_die "Project directory does not exist: $graph_target_dir" 2
graph_target_dir=$(CDPATH= cd -P "$graph_target_dir" && pwd)
[ -f "$graph_target_dir/package.json" ] ||
  graph_die "No package.json found in $graph_target_dir. Initialize the project before running Graph setup." 2

graph_need node

graph_target_name=$(node - "$graph_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
try {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (typeof manifest.name === 'string') process.stdout.write(manifest.name)
} catch {
  process.exit(1)
}
NODE
) || graph_die "Invalid package.json in $graph_target_dir." 2

[ "$graph_target_name" != '@neongate-ai/sinapsi' ] ||
  graph_die 'Project setup cannot install Sinapsi into the Sinapsi package itself.' 2

if [ -z "$graph_package_spec" ]; then
  graph_package_version=$(graph_project_version 2>/dev/null || true)
  [ -n "$graph_package_version" ] || graph_die 'Unable to resolve the executing Sinapsi version.'
  graph_package_spec="@neongate-ai/sinapsi@$graph_package_version"
fi

case "$graph_package_spec" in
  @neongate-ai/sinapsi|@neongate-ai/sinapsi@*) ;;
  *) graph_die "Package specifier must target @neongate-ai/sinapsi: $graph_package_spec" 2 ;;
esac

if [ -z "$graph_package_manager" ]; then
  graph_package_manager=$(node - "$graph_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
try {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  const value = typeof manifest.packageManager === 'string' ? manifest.packageManager : ''
  const manager = value.split('@')[0]
  if (['npm', 'pnpm', 'yarn', 'bun'].includes(manager)) process.stdout.write(manager)
} catch {
  process.exit(0)
}
NODE
)
fi

if [ -z "$graph_package_manager" ]; then
  if [ -f "$graph_target_dir/pnpm-lock.yaml" ]; then
    graph_package_manager=pnpm
  elif [ -f "$graph_target_dir/yarn.lock" ]; then
    graph_package_manager=yarn
  elif [ -f "$graph_target_dir/bun.lock" ] || [ -f "$graph_target_dir/bun.lockb" ]; then
    graph_package_manager=bun
  elif [ -f "$graph_target_dir/package-lock.json" ]; then
    graph_package_manager=npm
  else
    case "${npm_config_user_agent:-}" in
      pnpm/*) graph_package_manager=pnpm ;;
      yarn/*) graph_package_manager=yarn ;;
      bun/*) graph_package_manager=bun ;;
      *) graph_package_manager=npm ;;
    esac
  fi
fi

case "$graph_package_manager" in
  npm|pnpm|yarn|bun) ;;
  *) graph_die "Unsupported package manager: $graph_package_manager" 2 ;;
esac

graph_existing_dependency=$(node - "$graph_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const value = manifest.dependencies?.['@neongate-ai/sinapsi']
if (typeof value === 'string') process.stdout.write(value)
NODE
) || graph_die "Invalid package.json in $graph_target_dir." 2

if [ -n "$graph_existing_dependency" ] && [ "$graph_force" = false ]; then
  graph_print_success "@neongate-ai/sinapsi is already a project dependency ($graph_existing_dependency)"
else
  if [ "$graph_dry_run" = false ]; then
    graph_need "$graph_package_manager"
  fi

  graph_print_info "Installing $graph_package_spec with $graph_package_manager in $graph_target_dir"
  if [ "$graph_dry_run" = true ]; then
    case "$graph_package_manager" in
      npm) printf 'cd %s && npm install --save %s\n' "$graph_target_dir" "$graph_package_spec" ;;
      pnpm) printf 'cd %s && pnpm add %s\n' "$graph_target_dir" "$graph_package_spec" ;;
      yarn) printf 'cd %s && yarn add %s\n' "$graph_target_dir" "$graph_package_spec" ;;
      bun) printf 'cd %s && bun add %s\n' "$graph_target_dir" "$graph_package_spec" ;;
    esac
    exit 0
  fi

  cd "$graph_target_dir"
  case "$graph_package_manager" in
    npm) npm install --save "$graph_package_spec" ;;
    pnpm) pnpm add "$graph_package_spec" ;;
    yarn) yarn add "$graph_package_spec" ;;
    bun) bun add "$graph_package_spec" ;;
  esac
fi

graph_recorded_dependency=$(node - "$graph_target_dir/package.json" <<'NODE'
const fs = require('node:fs')
const file = process.argv[2]
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const value = manifest.dependencies?.['@neongate-ai/sinapsi']
if (typeof value === 'string') process.stdout.write(value)
NODE
) || graph_die "Invalid package.json after $graph_package_manager setup." 2
[ -n "$graph_recorded_dependency" ] ||
  graph_die "$graph_package_manager completed without adding @neongate-ai/sinapsi to dependencies."

graph_print_success "Sinapsi project setup completed ($graph_recorded_dependency)"
cat <<'NEXT'

Next step:

  import '@neongate-ai/sinapsi/browser'

  <sinap-si move="rotate" activation="40"></sinap-si>
NEXT
