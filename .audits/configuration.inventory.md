# Configuration ownership inventory

Updated 2026-09-17 for the Sinapsi package reconstruction.

## Authored defaults

| Owner | Binding/data | Responsibility |
| --- | --- | --- |
| `src/sinapsi.config.json` | `component` | Tag name, move/speed/nodes/activation defaults and limits |
| `src/sinapsi.config.json` | `palette` | Primary, text and muted colors |
| `src/sinapsi.config.json` | `graph` | Preferential-attachment degree and flattened force-layout disc |
| `src/sinapsi.config.json` | `motion` | Camera, rotation, jitter, pulse and activation timing |

The JSON is validated once by Zod and frozen. Provider credentials, product copy
and consumer secrets are never authored here.

## Composition and compatibility

`src/core/config.data.ts` parses the JSON, freezes it, and derives public
constants: tag name, limits, defaults, palette, color attributes, property
attributes and observed attributes. Schema modules own validation grammar
(`SINAPSI_MOVES`, hex color pattern, numeric text). Algorithms own numeric
helpers (`MS_PER_SECOND`, `TWO_PI`, log prefix). The element constructor
registry remains a WeakMap exemption.

| Runtime view | Composed source |
| --- | --- |
| `sinapsiConfiguration` | Zod-parsed `src/sinapsi.config.json` |
| `SINAPSI_TAG_NAME`, `SINAPSI_LIMITS`, `DEFAULT_SINAPSI_*` | `sinapsiConfiguration.component` / `.palette` |
| `SINAPSI_OBSERVED_ATTRIBUTES` | Color attributes plus move/speed/nodes/activation |
| Animation and scene services | `sinapsiConfiguration.motion` and `.graph` |

Mutable constructor registries, compiled matchers, types, CSS, tests and
engineering configuration are outside the data-authoring inventory.

## Executable enforcement

`configuration.audit.sh` enforces the compact JSON owner and derived
compatibility bindings. Architecture and tests protect observed attributes,
normalization and SSR import behavior.
