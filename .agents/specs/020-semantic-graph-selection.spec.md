# SPEC-020: Semantic JSON nodes and Obsidian selection

- Status: Superseded
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Prospective
- Owner: Sinapsi maintainers

## Problem

`<sinap-si>` only generates a decorative density graph. Consumers cannot supply
stable node identities, one-level links, or hover/click semantics. Host motion
also keeps tumbling while the pointer is over the graph, so nodes are hard to
inspect.

## Scope

In scope: public `nodes` JSON document, Zod parse/stringify, links-as-edges
layout, Obsidian one-level hover/click paint, `sinapsi-node-hover` /
`sinapsi-node-click` events, host hover-idle freeze, closed-shadow listbox,
sandbox, README, and tests.

Out of scope: Jotai, LangDrift models, npm publication, pan/zoom, native
`onclick` override.

## Requirements

1. Omitting `nodes` keeps the generated decorative graph at the configured
   internal density. Public `nodes` is not a density integer.
2. Present `nodes` is a JSON document `{ "nodes": SinapsiNode[] }` validated by
   Zod (0–400 nodes). The property accepts a document or JSON string and
   reflects the serialized document.
3. Each node has nonempty `id` and `name`, `event_name` `click` | `hover`,
   object `payload`, and `links` of ids in the same document. Reject duplicate
   ids, self-links, dangling links, and counts above 400. No partial apply.
4. Invalid `nodes` logs `[Sinapsi] Invalid nodes … Keeping previous graph.`
5. Host pointer-over (and semantic listbox focus, and
   `prefers-reduced-motion: reduce`) freezes motion as idle without writing
   `move`.
6. Hovering a semantic node highlights it and its undirected one-level
   neighborhood. `event_name: hover` dispatches `sinapsi-node-hover` once per
   enter.
7. Clicking a semantic node activates it and that neighborhood. `event_name:
   click` dispatches `sinapsi-node-click`. Keyboard Enter/Space uses the same
   click path with `input: 'keyboard'`.
8. Events bubble and compose from the host; detail is `{ node, input }`.
9. Semantic mode exposes a listbox sibling of the `aria-hidden` canvas.

## Acceptance criteria

- [x] Colocated tests cover parse/stringify, invalid keep-previous, neighborhood,
      pick, hover-idle freeze, and public events.
- [x] Decorative omission still generates a graph; `move` is unchanged while frozen.
- [x] Sandbox demonstrates JSON nodes, 1-hop hover, click activation, and freeze.
- [x] `./cli/graph check` passes.

## Evidence

`src/core/lib/normalize-nodes.compute.test.ts`,
`src/core/graph/create-semantic-graph.compute.test.ts`,
`src/factories/element-class.factory.test.ts`, `src/services/animation.service.test.ts`,
`./cli/graph check` (passed 2026-09-18), sandbox `graph dev` hover/click/keyboard.

## Related records

- ADRs: 0016
- Rules: 004, 005
- Context: `graph-and-activation.md`, `product.md`

## Compatibility and risks

0.x breaking change: `nodes="170"` is no longer a density integer. SSR imports
stay side-effect free. Interactive semantics apply only when a valid nodes
document is showing. Document shape, `event_name`, `{ node, input }`, BFS
`activation`, and the node ring are superseded by SPEC-021.
