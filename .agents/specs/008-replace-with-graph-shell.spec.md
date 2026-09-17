# SPEC-008: Replace runners with Graph shell

- Status: Implemented
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current
- Owner: Sinapsi maintainers

## Problem

A Node/MJS CLI would violate the POSIX command surface.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Keep cli/ shell-only with GRAPH_ prefixes and the sinapsi-graph launcher marker.

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
