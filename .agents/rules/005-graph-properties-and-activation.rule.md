---
description: Scopes palette tokens, move/speed/nodes normalization, neighborhood lighting, and console diagnostics for the sinaps-i public contract.
globs:
  - "src/core/**"
  - "src/domain/**"
  - "src/factories/element-class.factory.ts"
  - "README.md"
---
# Rule 005: Graph properties and activation

- Effective: 2026-08-21
- Updated: 2026-09-18
- Priority: Critical
- Applies: public attributes, normalizers, topology, and neighborhood lighting

1. Palette tokens are `color-primary`, `color-text`, and `color-muted`. There is no background token.
2. `move` is `idle`, `rotate`, or `pulse`; default `rotate`.
3. `speed` is unitless in `(0, 10]` defaulting to 1.
4. `nodes` omitted keeps the generated decorative graph. Present `nodes` is a
   Zod-validated JSON document `{ "graph": [...] }` (0–400). Invalid documents
   log `[Sinapsi] Invalid nodes … Keeping previous graph.`
5. There is no public `activation` fill. Decorative graphs stay muted. Semantic
   hover/click light the undirected one-level neighborhood (nodes and edges).
   Click draws `node.name` inside each activated disc. Node discs are never stroked.
6. Invalid properties log `[Sinapsi] Invalid …` and never throw from the element boundary.
7. Topology is a scale-free network (preferential attachment) laid out like Obsidian graph view; hub selection uses maximum degree.
