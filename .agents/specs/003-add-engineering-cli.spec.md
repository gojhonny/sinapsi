# SPEC-003: Add engineering CLI

- Status: Implemented
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction
- Owner: Sinapsi maintainers

## Problem

Engineering commands must not live as package-script aliases.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Ship POSIX `graph` with bootstrap, doctor, lint, typecheck, test, build, audit, and check.

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
