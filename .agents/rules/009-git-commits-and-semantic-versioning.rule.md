---
description: Scopes Conventional Commits, Commitlint, Husky, staged SemVer validation, release signals, and Git quality gates for Sinapsi.
globs:
  - "package.json"
  - "commitlint.config.cjs"
  - ".lintstagedrc.json"
  - "cli/.husky/**"
  - ".github/workflows/**"
---
# Rule 009: Git commits and semantic versioning

- Effective: 2026-09-04
- Priority: High
- Applies: commit messages, `package.json#version`, `cli/.husky/**`, and Git quality configuration

1. Commit messages follow Conventional Commits and are validated by Commitlint during `commit-msg`.
2. Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.
3. The `pre-commit` hook runs the staged SemVer gate before lint-staged.
4. Husky hooks remain executable thin shell adapters to Graph; business logic stays in `cli/src/commands/`.
5. `package.json#version` is canonical SemVer without a leading `v`.
6. A staged version change must be greater than the version in `HEAD`; downgrades and noncanonical versions fail.
7. Release planning treats `fix` and `perf` as patch signals, `feat` as a minor signal, and `!` or `BREAKING CHANGE` as a major signal.
8. Git quality tools are development dependencies and must not enter the runtime payload.
9. CI validates the relevant commit range in addition to running the package quality gate.
10. Committed-history validation (`graph git lint` and `graph git commits`) checks every non-merge commit in the requested range.
