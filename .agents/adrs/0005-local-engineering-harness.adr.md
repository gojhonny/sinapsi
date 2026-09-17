# ADR-0005: Local engineering harness

- Status: Accepted
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction

## Context

Sinapsi needed a durable decision for local engineering harness so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Version `.agents/`, `.audits/`, AGENTS.md, and POSIX Graph CLI as the engineering harness. Keep harness-score explicit and pinned.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

AGENTS.md, .agents/, .audits/, cli/

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
