---
description: Scopes palette tokens, move/speed/nodes/activation normalization, BFS hub fill, and console diagnostics for the sinap-si public contract.
globs:
  - "src/core/**"
  - "src/domain/**"
  - "src/factories/element-class.factory.ts"
  - "README.md"
---
# Rule 005: Graph properties and activation

- Effective: 2026-08-21
- Priority: Critical
- Applies: public attributes, normalizers, topology, and activation

1. Palette tokens are `color-primary`, `color-text`, and `color-muted`. There is no background token.
2. `move` is `idle`, `rotate`, or `pulse`; default `rotate`.
3. `speed` is unitless in `(0, 10]` defaulting to 1.
4. `nodes` is an integer 8–400 defaulting to 170. Values above 400 log an error and clamp to 400.
5. `activation` is 0–100 defaulting to 0 and fills nodes in BFS order from the highest-degree hub.
6. Invalid properties log `[Sinapsi] Invalid … Using …` and never throw from the element boundary.
7. Topology is a scale-free network (preferential attachment) laid out like Obsidian graph view; hub selection uses maximum degree.
