# Product context

Sinapsi is the `@neongate-ai/sinapsi` package: a framework-agnostic, SSR-safe
3D plexus with an Obsidian palette as one native custom element, `<sinap-si>`.

## Product boundary

The repository owns a library, not an application, documentation site, example
suite, backend, or framework wrapper. Consumers own page layout, branding beyond
the three palette tokens, and product logic.

## Public experience

The host is transparent. Consumers set `color-primary`, `color-text`, and
`color-muted`, choose `idle`, `rotate`, or `pulse` motion, scale `speed`,
choose `nodes` density, and fill the graph with `activation` from the hub.

Invalid properties log `[Sinapsi] Invalid … Using …` and recover to a default
or clamp. Nodes above 400 clamp to 400 after a console.error. The package does
not ship a background token, persona, or framework runtime wrapper.
