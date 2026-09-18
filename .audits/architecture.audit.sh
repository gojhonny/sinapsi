#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }
require_file() { if [ -f "$1" ]; then pass "$1"; else fail "missing $1"; fi; }
require_dir() { if [ -d "$1" ]; then pass "$1/"; else fail "missing $1/"; fi; }

for directory in \
  src/core/lib \
  src/core/math \
  src/core/graph \
  src/core/scene \
  src/domain/kernel \
  src/domain/schemas \
  src/factories \
  src/services
do
  require_dir "$directory"
done

for path in \
  src/sinapsi.config.json \
  src/core/config.data.ts \
  src/factories/element-class.factory.ts \
  src/factories/shadow-tree.factory.ts \
  src/services/animation.service.ts \
  src/services/registration.service.ts \
  src/services/renderer.service.ts \
  src/services/scene.service.ts
do
  require_file "$path"
done

if [ -e src/core/core.data.ts ]; then
  fail 'legacy src/core/core.data.ts remains; canonical configuration is src/sinapsi.config.json'
else
  pass 'configuration uses src/sinapsi.config.json with typed compatibility bindings'
fi

if find src \( -type f -o -type d \) -name 'sinapsi*' ! -path src/sinapsi.config.json -print | grep . >/dev/null 2>&1; then
  fail 'a source path begins with sinapsi outside the canonical JSON exception'
else
  pass 'source paths use responsibility names with the canonical JSON exception'
fi

if find src -type f \( -iname '*react*component*' -o -iname '*vue*' -o -iname '*svelte*' -o -iname '*angular*' \) -print | grep . >/dev/null 2>&1; then
  fail 'framework runtime source detected'
else
  pass 'no framework runtime wrapper source'
fi

if grep -F 'SINAPSI_OBSERVED_ATTRIBUTES' src/core/config.data.ts >/dev/null 2>&1 &&
  grep -F 'color-primary' src/core/config.data.ts >/dev/null 2>&1 &&
  grep -F 'nodes' src/core/config.data.ts >/dev/null 2>&1 &&
  grep -F 'static readonly observedAttributes = SINAPSI_OBSERVED_ATTRIBUTES' src/factories/element-class.factory.ts >/dev/null 2>&1; then
  pass 'element observed attributes derive from canonical configuration'
else
  fail 'element observed attributes must derive from canonical configuration including color and nodes'
fi

if grep -F '"tagName": "sinap-si"' src/sinapsi.config.json >/dev/null 2>&1 &&
  grep -F 'SINAPSI_TAG_NAME = sinapsiConfiguration.component.tagName' src/core/config.data.ts >/dev/null 2>&1; then
  pass 'custom element tag derives from canonical configuration'
else
  fail 'custom element tag must derive from canonical configuration'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d architecture audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nArchitecture audit passed.\n'
