# Sinapsi audits

These executable checks protect repository invariants broader than one unit
test. They are deterministic, network-free POSIX shell scripts.

After source setup, run all audits with:

```bash
graph audit
```

The complete quality gate also runs them through `graph check`.

- `architecture.audit.sh`: source boundaries, concern folders, and observed attributes.
- `configuration.audit.sh`: canonical JSON bindings and runtime exemptions recorded in [`configuration.inventory.md`](./configuration.inventory.md).
- `cli.audit.sh`: shell-only Graph command surface, direct managed-launcher invocation, lifecycle separation, and Sinapsi-specific naming.
- `cleanup.audit.sh`: isolated filesystem fixtures for default/nested dependency cleanup, protected and tracked paths, symlinks, dry runs, option validation and failure propagation.
- `documentation.audit.sh`: product-first README assets, consumer Web Component API coverage, repository-maintainer exclusion, and direct Graph CLI guidance.
- `harness.audit.sh`: record structure, frontmatter, dates, navigation, and terminology.
- `guardrails.audit.sh`: Cursor hook configuration, shell gate decisions, edit-hook containment, workflows, and reviewer metadata.
- `package.audit.sh`: payload, scripts, source-only launcher lifecycle, allowed runtime dependencies, `cli/.husky` adapters, Commitlint, and SemVer policy.
- `ownership.audit.sh`: npm package, GitHub owner, installer behavior and rejection of stale active references.
- `tests.audit.sh`: colocated suite layout, naming, Vitest configuration, and CI integration.

When an invariant changes intentionally, update its SPEC, linked ADR/rule,
implementation, documentation, and audit in the same change.
