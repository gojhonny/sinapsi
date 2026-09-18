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
omit `nodes` for a generated decorative graph or supply a `{ graph }` JSON
document. Hover and click light a one-level neighborhood; there is no 0–100
`activation` property.

Invalid properties log `[Sinapsi] Invalid … Using …` and recover to a default
or clamp, except invalid `nodes` documents keep the previous graph. The package
does not ship a background token, persona, or framework runtime wrapper.
