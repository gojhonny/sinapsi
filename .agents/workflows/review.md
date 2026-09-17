# Change review workflow

Use for a pre-merge review of Sinapsi code, package, or harness changes.

1. Read `AGENTS.md`, the changed SPEC, and linked ADRs/rules.
2. Use the `code-review` skill.
3. Inspect public exports, attributes, properties, and package payload changes first.
4. Verify SSR-safe imports and browser side effects remain isolated to the browser entry point.
5. Check Web Component lifecycle, closed-shadow canvas, palette tokens, activation clamping, and animation cleanup.
6. Confirm tests are colocated, deterministic, and exercise public behavior or justified factory internals.
7. Confirm docs, SPECs, ADRs, rules, audits, and CLI help remain synchronized.
8. Run `graph lint`, `graph typecheck`, and `graph test` when reviewing executable changes.
9. Run `graph check` before declaring the change release-ready.
10. Report findings by severity with exact file/behavior evidence.
