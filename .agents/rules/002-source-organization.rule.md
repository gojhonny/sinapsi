---
description: Scopes source organization, concern folders, naming, suffixes, and colocated-test placement for the Sinapsi TypeScript package.
globs:
  - "src/**"
  - "tsconfig*.json"
  - "tsdown*.ts"
---
# Rule 002: Source organization

- Effective: 2026-08-21
- Updated: 2026-09-17
- Priority: Critical
- Applies: `src/**`

1. Keep `domain/kernel/`, `domain/schemas/`, `factories/`, and `services/` under `src/`.
2. Use `core/lib/`, `core/math/`, `core/graph/`, and `core/scene/` for their named concerns.
3. A source folder must contain at least two related source files or be flattened.
4. No file or directory below `src/` may begin with `sinapsi` or `sinapsi-`, except the owner-selected canonical configuration file `src/sinapsi.config.json`.
5. Production modules use `.types.ts`, `.schema.ts`, `.service.ts`, `.factory.ts`, `.compute.ts`, `.data.ts`, and `.client.ts` according to responsibility.
6. Colocated tests append `.test.ts` to the tested source base name under Rule 010.
7. Public entry points may use `index.ts` and `index.css`.
8. `src/sinapsi.config.json` owns editable component, palette, graph and motion settings. Compatibility exports derive from the frozen parsed runtime.
9. Never add framework-specific runtime components.
