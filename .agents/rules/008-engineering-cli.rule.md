---
description: Scopes the shell-only Graph engineering CLI, direct launcher command surface, network boundaries, cleanup safety, setup behavior, and CI diagnostics.
globs:
  - "cli/**"
  - "package.json"
  - ".github/workflows/**"
---
# Rule 008: Engineering CLI

- Effective: 2026-09-04
- Updated: 2026-09-18
- Priority: High
- Applies: `cli/**` and CLI package integration

1. The repository CLI is named Graph and every implementation file is POSIX shell.
2. Do not add a Node, MJS, TypeScript, or framework-based command runner.
3. Repository commands include `bootstrap`, `setup`, `doctor`, `cleanup`, `lint`, `typecheck`, `test`, `dev`, `build`, `harness`, `audit`, `check`, and the Git quality subcommands.
4. Graph is the canonical repository command surface. After source setup, human and agent engineering instructions use `graph <command>` directly; do not require `pnpm exec graph`, `npm exec -- graph`, or equivalent local-bin runners.
5. A local root `pnpm install` may provision the managed user-scoped launcher through `pnpm:devPreinstall`.
6. The `setup` package script is a recovery bridge for refreshing the launcher; `prepack` is the release safety lifecycle.
7. `bootstrap` may install declared development dependencies. Explicit consumer project setup may install the Sinapsi runtime dependency. The explicit `harness` command may invoke its external harness utility. No other command performs network installation.
8. Repository launcher setup must not edit shell profiles or replace unmanaged paths.
9. Consumer setup must not generate or overwrite application source files.
10. `cleanup` removes untracked generated state and root/nested dependencies by default. Protect tracked paths, `.git/`, `.agents/`, `.audits/`, source, assets and nested repositories.
11. `doctor` exits nonzero when required repository conditions fail and supports CI mode.
12. Repository-only commands reject execution from the published package.
