# ADR-0004: Vitest and happy-dom testing

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction

## Context

Sinapsi needed a durable decision for vitest and happy-dom testing so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Use Vitest with happy-dom by default and Node for SSR import tests. Colocate executable suites under src/.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

vitest.config.ts, src/**/*.test.ts, test/setup.ts

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
