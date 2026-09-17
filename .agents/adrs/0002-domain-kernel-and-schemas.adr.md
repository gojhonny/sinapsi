# ADR-0002: Domain kernel and Zod schemas

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction

## Context

Sinapsi needed a durable decision for domain kernel and zod schemas so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Own public contracts in `domain/kernel` and validate configuration plus attributes with Zod schemas in `domain/schemas`. Recover invalid values at the element boundary.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

src/domain/**, src/core/lib/normalize-*.compute.ts

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
