# Graph and activation context

`<sinap-si>` renders an Obsidian-style knowledge graph in a transparent canvas:
scale-free hubs, muted leaves, thin gray edges, and primary fill for activation.
Node radius follows degree. Activation fills nodes in BFS order from the
highest-degree hub using the primary color; resting nodes blend muted to text
by connectivity.

`move` is `idle` (still), `rotate` (default in-plane spin), or `pulse` (heartbeat
lub-dub scale). `speed` is a unitless multiplier in `(0, 10]` defaulting to 1.
`nodes` is an integer 8–400 defaulting to 170. `activation` is 0–100 defaulting
to 0.

The host remains `inline-block` at `16rem` with a transparent background so the
page supplies the surface behind the graph.
