# ADR-0001: Native Web Component boundary

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-09-17
- Mode: Retrospective reconstruction

## Context

Graphz needed a durable decision for native web component boundary so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Ship one native `<graph-z>` custom element with a closed shadow canvas. Keep the main entry SSR-safe and confine registration to `@neongate-ai/graphz/browser`.

## Consequences

The native-element boundary remains an architectural commitment. Product package
and tag names are superseded by ADR-0014.

## Evidence

src/index.ts, src/browser.client.ts, src/factories/element-class.factory.ts, src/index.test.ts

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
- Superseded in part by: ADR-0014 (Sinapsi product identity)
