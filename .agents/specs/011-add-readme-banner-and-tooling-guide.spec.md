# SPEC-011: Add README banner and tooling guide

- Status: Implemented
- Created: 2026-09-04
- Updated: 2026-09-19
- Mode: Current
- Owner: Sinapsi maintainers

## Problem

Consumers needed a product-first README; maintainers needed cli/readme.md.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Ship a centered HTML headline, banner, badges, and consumer API docs; keep Graph commands in cli/readme.md.

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
