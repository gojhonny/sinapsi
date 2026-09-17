# ADR-0006: Source concern folders

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction

## Context

Sinapsi needed a durable decision for source concern folders so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Organize source by concern: domain, core/lib|math|graph|scene, factories, services. Forbid sinapsi-prefixed paths except src/sinapsi.config.json.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

src/, .audits/architecture.audit.sh

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
