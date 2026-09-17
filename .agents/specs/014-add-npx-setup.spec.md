# SPEC-014: Add npx project setup

- Status: Implemented
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current
- Owner: Sinapsi maintainers

## Problem

Published CLI needed a consumer installer distinct from repository mode.

## Scope

In scope: the Sinapsi package, CLI, harness, and audits needed to satisfy this change. Out of scope: documentation sites, framework example apps, and npm publication.

## Requirements

Default published `graph` installs @neongate-ai/sinapsi and prints the registration snippet.

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
