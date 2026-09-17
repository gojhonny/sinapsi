# ADR-0010: Graph as the single command surface

- Status: Accepted
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current

## Context

Sinapsi needed a durable decision for graph as the single command surface so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

After source setup, humans and agents use `graph <command>` directly. Do not duplicate commands as package-script aliases.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

cli/readme.md, package.json scripts, Rule 008

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
