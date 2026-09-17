# ADR-0003: Canvas graph rendering

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction

## Context

Sinapsi needed a durable decision for canvas graph rendering so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Render an Obsidian-style scale-free graph on a transparent canvas. Node radius follows degree. Activation fills BFS order from the hub using the primary color.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

src/core/graph/**, src/services/renderer.service.ts, src/services/scene.service.ts

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
