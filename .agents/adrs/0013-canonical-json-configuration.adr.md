# ADR-0013: Canonical JSON configuration

- Status: Accepted
- Created: 2026-09-17
- Updated: 2026-09-17
- Mode: Current

## Context

Sinapsi needed a durable decision for canonical json configuration so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Author defaults in src/sinapsi.config.json. Parse once with Zod, freeze, and derive public constants from config.data.ts.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

src/sinapsi.config.json, src/core/config.data.ts, .audits/configuration.audit.sh

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
