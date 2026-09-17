# ADR-0007: POSIX shell Graph CLI

- Status: Accepted
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current

## Context

Sinapsi needed a durable decision for posix shell graph cli so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Implement the engineering CLI entirely in POSIX shell as `graph`. Package scripts stay limited to launcher setup, recovery, and prepack.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

cli/, package.json, .audits/cli.audit.sh

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
