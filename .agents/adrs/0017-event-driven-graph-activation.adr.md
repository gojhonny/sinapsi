# ADR-0017: Event-driven graph activation

- Status: Accepted
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Retrospective

## Context

SPEC-020 kept a decorative 0–100 `activation` fill and gated host events on
per-node `event_name`. Consumers now own lighting exclusively through hover and
click on a `{ graph: Node[] }` document whose links are `{ id, name }` objects.

A white node ring was a non-color cue that fought the Obsidian disc language.
Names belong inside click-activated discs, not as a halo or offset caption.

## Decision

1. Public `activation` is removed. Decorative omitted-`nodes` graphs never
   primary-fill.
2. Hover and click always emit `sinapsi-node-hover` / `sinapsi-node-click` with
   `{ id, event, payload }`.
3. The 1-hop neighborhood lights nodes and connecting edges. Click also draws
   `node.name` centered in each activated disc. Node circles are never stroked.

## Consequences

BFS hub fill is gone from the public contract. `activation-order` remains an
internal rank for generated topology only. Assistive technology still uses the
semantic listbox names.

## Evidence

`.agents/specs/021-graph-document-and-event-activation.spec.md`,
`src/domain/schemas/nodes.schema.ts`, `src/services/renderer.service.ts`,
`src/factories/element-class.factory.ts`

## Related records

- SPEC: 021
- Rules: 004, 005
- Supersedes: SPEC-020 `activation` and ring paint; ADR-0016 decorative BFS fill
