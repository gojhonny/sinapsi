# ADR-0008: Git quality gates

- Status: Accepted
- Created: 2026-09-04
- Updated: 2026-09-04
- Mode: Current

## Context

Sinapsi needed a durable decision for git quality gates so later work could stay compatible with the native Web Component, SSR-safe package, and engineering harness.

## Decision

Use Conventional Commits, Commitlint, Husky thin adapters, lint-staged, and forward-only SemVer validation owned by Graph.

## Consequences

The decision is now an architectural commitment. Compatible changes refine it; incompatible changes require a new ADR that supersedes this record.

## Evidence

commitlint.config.cjs, .husky/, cli/src/commands/git-*.sh

## Related records

- SPEC: see the matching numbered specification
- Rules: 001–012 as applicable
