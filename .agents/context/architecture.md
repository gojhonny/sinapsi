# Architecture context

## Entry points

- `sinapsi` is side-effect free and safe to import during SSR.
- `sinapsi/browser` registers `<sinaps-i>` in the active custom-element registry.
- `sinapsi/react-types` provides type-only JSX augmentation.
- `sinapsi/standalone` is the direct-browser bundle with motion and zod inlined.
- `sinapsi/index.css` exposes package CSS when explicitly needed.

## Runtime layers

`domain/kernel/` owns public and internal type contracts. `domain/schemas/` owns
Zod validation. `core/lib/` normalizes invalid properties and parses the semantic `nodes`
document. `core/graph/` builds the scale-free topology, force layout, BFS
activation order, and link-derived semantic graphs. `core/scene/` projects, pulses,
and hit-tests painted nodes.
`factories/` create the closed shadow tree and the DOM-dependent class only when
a DOM exists. `services/` own scene state, canvas rendering, animation, and
registration.

The shadow tree is closed. The canvas stays `aria-hidden`. When a valid semantic
`nodes` document is showing, a listbox sibling of that canvas exposes node names.
Tests and consumers must use public properties and attributes rather than private
descendants; focused factory tests may inspect the generated listbox.

## Dependency direction

Pure data and types do not depend on DOM services. Browser registration is
isolated from the main entry point. No framework runtime is part of the package.
`src/sinapsi.config.json` is the single authored defaults file; `config.data.ts`
derives public constants after Zod parse and freeze.
