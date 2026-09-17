---
description: Index of Sinapsi engineering rules. Not an executable rule.
alwaysApply: false
---
# Repository rules

Rules are mandatory constraints for every Sinapsi change. Read all numbered rules
before editing public APIs, source layout, graph behavior, tests, Git hooks,
engineering CLI, harness files, or package metadata.

Numbered rules are stable identifiers. A rule change requires a SPEC and should
reference an ADR when it changes architecture. Current rules also require a
shell-only Graph CLI, Conventional Commits, forward-only SemVer changes,
colocated Vitest suites, explicit npx project setup, and agent runtime guardrails.
