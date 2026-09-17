# ADR-0011: Public Graph installer

- Status: Accepted
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current

## Context

Sinapsi needed a durable decision for public graph installer so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Publish one `graph` binary. Default published invocation installs `@neongate-ai/sinapsi` into an existing project without writing application source.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

cli/src/commands/setup-project.sh, Rule 011

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
