# SPEC-001: Reconstruct Sinapsi harness

- Status: Implemented
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction
- Owner: Sinapsi maintainers

## Problem

The package needed a complete engineering harness modeled on orbz without copying voice product assumptions.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Provide AGENTS.md, .agents records, .audits, Graph CLI, and CI sensors.

## Acceptance criteria

- [x] Observable behavior matches the requirements.
- [x] Colocated tests or executable audits provide evidence.
- [x] Documentation and harness records stay synchronized.

## Evidence

`./cli/graph check`, colocated Vitest suites, and `.audits/*.audit.sh`.

## Related records

- ADRs: matching numbered decisions
- Rules: 001–012 as applicable

## Compatibility and risks

Public API, SSR import, accessibility of the closed canvas, and package payload remain compatible unless this SPEC explicitly changes them.
