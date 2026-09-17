# SPEC-002: Repair source organization

- Status: Implemented
- Created: 2026-08-21
- Updated: 2026-08-21
- Mode: Retrospective reconstruction
- Owner: Sinapsi maintainers

## Problem

Source needed concern folders, suffix naming, and a single canonical JSON exception.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Place kernel, schemas, graph computes, factories, and services under src/ with colocated tests.

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
