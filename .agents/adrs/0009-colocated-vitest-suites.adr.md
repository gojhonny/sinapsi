# ADR-0009: Colocated Vitest suites

- Status: Accepted
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current

## Context

Sinapsi needed a durable decision for colocated vitest suites so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Place executable tests beside source. Canonical describe prefixes are core, factory, service, and schema.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

src/**/*.test.ts, .audits/tests.audit.sh

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
