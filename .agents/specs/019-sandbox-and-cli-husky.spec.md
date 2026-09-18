# SPEC-019: Sandbox path and CLI Husky adapters

- Status: Implemented
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Prospective
- Owner: Sinapsi maintainers

## Problem

The local Vite app lives in `demo/`, and Husky adapters live at the repository
root `.husky/`. Engineering layout should colocate the interactive sandbox and
Git hook adapters with Graph. Root `.husky/` would also be packed if the
adapters moved under `cli/` without narrowing the npm `files` whitelist.

## Scope

In scope: `sandbox/` (formerly `demo/`), `graph dev`, `cli/.husky/`, Graph git
setup/doctor, package payload, audits, and harness records for those paths.

Out of scope: public `<sinap-si>` attributes, rewriting historical SPEC-012/016
or ADR-0008 bodies, npm publication.

## Requirements

1. The local Vite app lives at `sandbox/`.
2. `graph dev` serves it with `vite sandbox --config vite.config.ts`.
3. Husky adapters live at `cli/.husky/pre-commit` and `cli/.husky/commit-msg`.
4. `graph git setup` writes those adapters and runs `pnpm exec husky cli/.husky`.
5. `graph git doctor` expects `core.hooksPath=cli/.husky/_`.
6. After setup, repository-root `.husky/` is absent.
7. `package.json#files` publishes `dist`, `cli/graph`, `cli/readme.md`, and
   `cli/src` only.
8. `npm pack --dry-run` listing contains no `.husky` path.

## Acceptance criteria

- [x] `sandbox/` exists and `demo/` does not.
- [x] `graph dev --help` names the sandbox path.
- [x] `cli/.husky/` holds the thin Graph adapters; root `.husky/` is gone.
- [x] Package `files` excludes `cli/.husky`; pack listing has no `.husky`.
- [x] `graph git doctor` and `./cli/graph check` pass.

## Evidence

`cli/src/commands/dev.sh`, `cli/src/commands/git-setup.sh`,
`cli/src/commands/git-doctor.sh`, `.audits/package.audit.sh`, `./cli/graph check`.

## Related records

- ADRs: 0015
- Rules: 008, 009
- Context: `release.md`

## Compatibility and risks

Public API, SSR, and accessibility are unchanged. The npm payload becomes more
specific (`cli/src` instead of the whole `cli/` tree) so Git hooks stay out of
the tarball. Local checkouts must re-run `graph git setup` so `core.hooksPath`
points at `cli/.husky/_`.
