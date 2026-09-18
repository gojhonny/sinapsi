# SPEC-021: Graph document and event-driven activation

- Status: Implemented
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Retrospective
- Owner: Sinapsi maintainers

## Problem

SPEC-020 still uses `{ nodes }`, per-node `event_name`, a 0–100 `activation`
property, white node rings, and name labels that are not inside activated discs.
Consumers supply `{ graph: Node[] }` with `{ id, name }` links, want hover/click
to drive lighting, and need `node.name` drawn in every click-activated disc.

## Scope

In scope: `{ graph }` JSON document, `Link` objects, drop public `activation`,
always-emit `sinapsi-node-hover` / `sinapsi-node-click` with
`{ id, event, payload }`, 1-hop node and edge lighting, in-disc names on click,
no node ring, sandbox, README, tests.

Out of scope: Jotai, LangDrift models, npm publication, pan/zoom.

## Requirements

1. The `nodes` attribute holds `{ "graph": SinapsiNode[] }` (0–400). Each node is
   `{ id, name, payload, links: { id, name }[] }`. `payload` is an opaque object.
   `link.id` must name another node in the same document. Reject self-links,
   dangling ids, duplicate node ids, empty names, and counts above 400.
2. Invalid documents log `[Sinapsi] Invalid nodes … Keeping previous graph.`
3. There is no public `activation` attribute or property. Decorative omitted
   `nodes` graphs stay muted.
4. Hover always highlights the undirected 1-hop nodes and connecting edges and
   always dispatches `sinapsi-node-hover` once per enter. Click always activates
   that set, lights those edges, draws `node.name` centered inside every
   activated disc, and always dispatches `sinapsi-node-click`. Hover does not
   show names. Node discs are never stroked.
5. Event detail is `{ id, event: 'click' | 'hover', payload }`. Keyboard
   Enter/Space uses the click path.

## Acceptance criteria

- [x] Colocated tests cover the `graph` document, keep-previous, always-emit
      events, labeled click set, and decorative graphs that never primary-fill.
- [x] Renderer never strokes node discs; names appear only after click, inside
      each activated disc.
- [x] Sandbox uses `{ graph }` with link objects and echoes `{ id, event, payload }`.
- [x] `./cli/graph check` passes.

## Evidence

`src/domain/schemas/nodes.schema.test.ts`,
`src/factories/element-class.factory.test.ts`,
`src/services/scene.service.test.ts`, `src/services/renderer.service.test.ts`,
`./cli/graph check` (passed 2026-09-18), sandbox `graph dev` hover/click labels.

## Related records

- ADRs: 0017
- Rules: 004, 005
- Supersedes: SPEC-020 document shape, `event_name`, `{ node, input }`, BFS
  `activation`, and the node ring

## Compatibility and risks

0.x breaking change to the `nodes` JSON shape and removal of `activation`.
SSR imports stay side-effect free.
