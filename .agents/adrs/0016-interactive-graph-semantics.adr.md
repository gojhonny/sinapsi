# ADR-0016: Interactive semantic graph

- Status: Accepted
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Prospective

## Context

ADR-0003 and Rule 004 treat `<sinap-si>` as a purely visual canvas. Consumers now
need stable node ids, one-level links, and hover/click activation without pulling
application state into the package.

A numeric `nodes` density cannot carry those identities. JSON on the existing
`nodes` attribute keeps one public slot and still allows omitting the attribute
for the generated decorative graph.

## Decision

1. When `nodes` is omitted, keep a generated decorative plexus and a hidden
   canvas.
2. When `nodes` holds a valid JSON document, layout only the supplied `links`,
   paint Obsidian one-level hover/click neighborhoods, and expose a listbox
   sibling of the `aria-hidden` canvas.
3. Dispatch `sinapsi-node-hover` and `sinapsi-node-click` from the host; do not
   override `onclick`.
4. Freeze motion as idle while the pointer is over the host without writing
   `move`.

## Consequences

`nodes` is a 0.x breaking JSON contract. Decorative `activation` 0–100 does not
light a semantic graph; click neighborhood does. Assistive technology sees the
listbox only in semantic mode.

## Evidence

`.agents/specs/020-semantic-graph-selection.spec.md`,
`src/domain/schemas/nodes.schema.ts`, `src/factories/element-class.factory.ts`,
`src/factories/shadow-tree.factory.ts`

## Related records

- SPEC: 020
- Rules: 004, 005
- Supersedes: ADR-0003 interaction absence, and Rule 004 item 1, only while a
  valid nodes document is showing
