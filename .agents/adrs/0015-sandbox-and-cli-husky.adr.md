# ADR-0015: Sandbox path and CLI Husky adapters

- Status: Accepted
- Created: 2026-09-18
- Updated: 2026-09-18
- Mode: Prospective

## Context

ADR-0008 placed Husky adapters at repository-root `.husky/` and Graph still owns
hook behavior. The interactive Vite app lived in `demo/`. Both are engineering
surfaces that belong next to Graph rather than at the package root.

Husky 9.1.7 activates a directory with a positional argument (`husky cli/.husky`)
and sets `core.hooksPath` to that directory’s `_` helper. `package.json#files`
currently includes the whole `cli/` tree, so adapters under `cli/` would enter
the npm payload unless the whitelist is narrowed. Release context already
forbids Git hooks in the published package.

## Decision

1. Serve the local Vite app from `sandbox/` via `graph dev`.
2. Keep Husky adapters thin and store them at `cli/.husky/`.
3. Graph continues to own pre-commit and commit-message behavior.
4. Publish only `dist`, `cli/graph`, `cli/readme.md`, and `cli/src`.

## Consequences

`graph git setup` must write `cli/.husky/` and remove leftover root `.husky/`.
Doctor and audits check `cli/.husky/_` as `core.hooksPath`. The published CLI
surface is the Graph binary and its shell sources, not repository Git gates.

## Evidence

`sandbox/`, `cli/.husky/`, `cli/src/commands/dev.sh`,
`cli/src/commands/git-setup.sh`, `package.json`, `.audits/package.audit.sh`,
`.agents/specs/019-sandbox-and-cli-husky.spec.md`

## Related records

- SPEC: 019
- Rules: 008, 009
- Supersedes: ADR-0008 hook-directory evidence only; thin adapters and Graph
  ownership remain
