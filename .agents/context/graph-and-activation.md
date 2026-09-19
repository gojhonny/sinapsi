# Graph and activation context

`<sinaps-i>` renders a 3D plexus with an Obsidian palette in a transparent canvas:
scale-free hubs, muted leaves, thin gray edges, and primary fill for a hover or
click neighborhood. Node radius follows degree. Node discs are never stroked.

Omitting `nodes` generates a decorative graph at the configured internal density
(170). That graph stays muted. Present `nodes` is a Zod-validated JSON document
`{ graph: SinapsiNode[] }` (0–400). Each node has `id`, `name`, opaque `payload`,
and `links: { id, name }[]`. Layout uses only `link.id` as undirected edges.
Invalid documents log `[Sinapsi] Invalid nodes … Keeping previous graph.`

Hover lights the undirected one-level neighborhood (nodes and connecting edges)
and dims the rest. Click persists that lighting and draws `node.name` centered
inside every activated disc.

`move` is `idle` (still), `rotate` (default 3D tumble on a random wandering axis),
or `pulse` (heartbeat compact/expand of the whole cloud). `speed` is a unitless multiplier in
`(0, 10]` defaulting to 1. Pointer-over the host, listbox focus, and
`prefers-reduced-motion: reduce` freeze motion as idle without writing `move`.

The host remains `inline-block` at `16rem` with a transparent background so the
page supplies the surface behind the graph.
