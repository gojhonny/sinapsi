# Architecture context

## Entry points

- `@neongate-ai/sinapsi` is side-effect free and safe to import during SSR.
- `@neongate-ai/sinapsi/browser` registers `<sinap-si>` in the active custom-element registry.
- `@neongate-ai/sinapsi/react-types` provides type-only JSX augmentation.
- `@neongate-ai/sinapsi/standalone` is the direct-browser bundle with motion and zod inlined.
- `@neongate-ai/sinapsi/index.css` exposes package CSS when explicitly needed.

## Runtime layers

`domain/kernel/` owns public and internal type contracts. `domain/schemas/` owns
Zod validation. `core/lib/` normalizes invalid properties. `core/graph/` builds
the scale-free topology, force layout, and BFS activation order. `core/scene/` projects and pulses.
`factories/` create the closed shadow tree and the DOM-dependent class only when
a DOM exists. `services/` own scene state, canvas rendering, animation, and
registration.

The shadow tree is closed and visual-only. Tests and consumers must use public
properties and attributes rather than private descendants.

## Dependency direction

Pure data and types do not depend on DOM services. Browser registration is
isolated from the main entry point. No framework runtime is part of the package.
`src/sinapsi.config.json` is the single authored defaults file; `config.data.ts`
derives public constants after Zod parse and freeze.
