#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

for path in src/sinapsi.config.json .audits/configuration.inventory.md; do
  if [ -f "$path" ]; then pass "$path"; else fail "missing $path"; fi
done

if grep -E '"(byState|speech|presets)"[[:space:]]*:' src/sinapsi.config.json >/dev/null; then
  fail 'canonical JSON must not reintroduce voice, preset or byState blocks'
else
  pass 'canonical JSON stays compact for Sinapsi palette, graph and motion'
fi

if grep -F 'configurationSchema.parse(source)' src/core/config.data.ts >/dev/null 2>&1 &&
  grep -F 'sinapsiConfiguration.component.tagName' src/core/config.data.ts >/dev/null 2>&1 &&
  grep -F 'sinapsiConfiguration.palette' src/core/config.data.ts >/dev/null 2>&1; then
  pass 'config.data.ts derives public constants from canonical JSON'
else
  fail 'config.data.ts must remain a derived compatibility module'
fi

if grep -F 'new WeakMap<object, SinapsiElementConstructor>()' src/factories/element-class.factory.ts >/dev/null 2>&1; then
  pass 'element constructor registry remains a WeakMap exemption'
else
  fail 'element constructor registry must remain a WeakMap keyed by HTMLElement'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d configuration audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nConfiguration audit passed.\n'
