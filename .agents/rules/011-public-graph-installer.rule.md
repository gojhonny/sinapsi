---
description: Scopes the published Graph binary, npx project setup, source-checkout launcher, package-manager detection, runtime payload, and consumer-install safety boundaries.
globs:
  - "package.json"
  - "cli/**"
  - "README.md"
---
# Rule 011: Public Graph installer

- Effective: 2026-09-04
- Updated: 2026-09-17
- Priority: High
- Applies: `package.json`, `cli/**`, release documentation, and npm payload

1. The package exposes exactly one binary named `graph`, implemented with POSIX shell.
2. The canonical npx form is `npx --package=sinapsi@latest graph`; it performs explicit consumer project setup, not repository engineering operations.
3. Consumer setup requires an existing `package.json`, installs Sinapsi into `dependencies`, and never overwrites application source files.
4. Detect npm, pnpm, yarn, or bun from explicit input, `packageManager`, lockfiles, then npm as the fallback.
5. Install the same Sinapsi version that supplied the running CLI unless an explicit package specifier is provided.
6. Do not trigger consumer setup or repository launcher setup through `preinstall`, `install`, `postinstall`, or `prepare`.
7. Repository-only commands must reject execution when the CLI is running from the published package.
8. Package scripts must not duplicate Graph commands. `pnpm:devPreinstall` is permitted only as a root-project local-install hook.
9. `prepack` must delegate to `./cli/graph check`.
10. `dist/`, `cli/`, and npm's standard root metadata are the only intentional package payload.
11. Source-checkout engineering documentation uses `graph <command>` directly after local setup.
12. The root README is consumer implementation documentation for the Web Component and its public API.
