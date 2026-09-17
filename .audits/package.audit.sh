#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

node <<'NODE'
const { readFileSync } = require('node:fs')

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []
const pass = (message) => console.log(`PASS  ${message}`)
const fail = (message) => {
  console.error(`FAIL  ${message}`)
  failures.push(message)
}

if (pkg.type === 'module') pass('package is ESM')
else fail('package type must be module')

if (JSON.stringify(pkg.files) === JSON.stringify(['dist', 'cli'])) pass('npm payload is limited to dist and cli')
else fail('package files must contain exactly dist and cli')

const runtime = Object.keys(pkg.dependencies ?? {}).sort()
const expectedRuntime = ['motion', 'zod']
if (JSON.stringify(runtime) === JSON.stringify(expectedRuntime)) pass('package runtime dependencies are motion and zod')
else fail(`unexpected runtime dependencies: ${runtime.join(', ') || '(none)'}`)
if (pkg.dependencies?.motion === '13.4.0') pass('motion 13.4.0')
else fail('motion must be pinned to 13.4.0')
if (pkg.dependencies?.zod === '4.6.5') pass('zod 4.6.5')
else fail('zod must be pinned to 4.6.5')

if (pkg.bin?.graph === './cli/graph' && Object.keys(pkg.bin).length === 1) pass('package exposes exactly the graph binary')
else fail('package bin must expose only graph -> ./cli/graph')

for (const entry of ['.', './browser', './react-types', './standalone', './index.css', './package.json']) {
  if (entry in pkg.exports) pass(`export ${entry}`)
  else fail(`missing export ${entry}`)
}

const scripts = pkg.scripts ?? {}
const expectedScripts = ['pnpm:devPreinstall', 'prepack', 'setup']
if (JSON.stringify(Object.keys(scripts).sort()) === JSON.stringify(expectedScripts)) {
  pass('package scripts contain only source launcher setup, setup recovery, and prepack')
} else {
  fail(`unexpected package script aliases: ${Object.keys(scripts).sort().join(', ')}`)
}
if (scripts['pnpm:devPreinstall'] === './cli/graph setup --launcher --bootstrap') {
  pass('local pnpm install provisions the managed Graph launcher')
} else {
  fail('pnpm:devPreinstall must provision the managed Graph launcher')
}
if (scripts.setup === './cli/graph setup --launcher') pass('setup recovery bridge delegates to Graph')
else fail('setup recovery bridge must delegate to Graph launcher setup')
if (scripts.prepack === './cli/graph check') pass('prepack delegates to complete Graph check')
else fail('prepack must delegate to ./cli/graph check')
for (const forbidden of ['preinstall', 'install', 'postinstall', 'prepare']) {
  if (!(forbidden in scripts)) pass(`no ${forbidden} setup side effect`)
  else fail(`${forbidden} must not trigger setup`)
}

if (Object.values(scripts).some((value) => /cli\/.*\.mjs|node .*cli\//.test(value))) {
  fail('package scripts retain a Node/MJS CLI runner')
} else {
  pass('package scripts contain no Node/MJS CLI runner')
}

const expectedDependencies = {
  '@commitlint/cli': '21.2.2',
  '@commitlint/config-conventional': '21.2.2',
  husky: '9.1.7',
  'lint-staged': '17.5.1',
  semver: '7.8.5'
}
for (const [name, version] of Object.entries(expectedDependencies)) {
  if (pkg.devDependencies?.[name] === version) pass(`${name} ${version}`)
  else fail(`${name} must be pinned to ${version}`)
}

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
if (semverPattern.test(pkg.version)) pass(`package version is canonical SemVer: ${pkg.version}`)
else fail(`package version is not canonical SemVer: ${pkg.version}`)

if (pkg.engines?.node === '>=24') pass('Node engine remains >=24')
else fail('Node engine must remain >=24')

const commitlint = require('./commitlint.config.cjs')
if (commitlint.extends?.includes('@commitlint/config-conventional')) pass('Commitlint extends config-conventional')
else fail('Commitlint must extend @commitlint/config-conventional')

const staged = JSON.parse(readFileSync('.lintstagedrc.json', 'utf8'))
if (Object.values(staged).some((value) => String(value).includes('biome check --write'))) pass('lint-staged runs Biome')
else fail('lint-staged must run Biome')
if (Object.values(staged).some((value) => String(value).includes('shell-syntax.sh'))) pass('lint-staged validates shell syntax')
else fail('lint-staged must validate shell syntax')

if (failures.length > 0) {
  console.error(`\n${failures.length} package audit failure(s).`)
  process.exit(1)
}
console.log('\nPackage metadata audit passed.')
NODE

if [ -x cli/graph ] && /bin/sh -n cli/graph; then
  printf 'PASS  package bin is executable POSIX shell\n'
else
  printf 'FAIL  package bin must be executable POSIX shell\n' >&2
  exit 1
fi

for hook in .husky/pre-commit .husky/commit-msg; do
  if [ -f "$hook" ] && [ -x "$hook" ] && /bin/sh -n "$hook"; then
    printf 'PASS  %s is an executable shell hook\n' "$hook"
  else
    printf 'FAIL  %s must be an executable shell hook\n' "$hook" >&2
    exit 1
  fi
done

if grep -F 'graph git pre-commit' .husky/pre-commit >/dev/null 2>&1; then printf 'PASS  pre-commit delegates to Graph\n'; else printf 'FAIL  pre-commit must delegate to Graph\n' >&2; exit 1; fi
if grep -F 'graph git commit-message' .husky/commit-msg >/dev/null 2>&1; then printf 'PASS  commit-msg delegates to Graph\n'; else printf 'FAIL  commit-msg must delegate to Graph\n' >&2; exit 1; fi

for config in tsdown.config.ts tsdown.standalone.config.ts; do
  if grep -E 'sourcemap:[[:space:]]*false' "$config" >/dev/null 2>&1; then
    printf 'PASS  %s disables source maps\n' "$config"
  else
    printf 'FAIL  %s must disable source maps\n' "$config" >&2
    exit 1
  fi
done
