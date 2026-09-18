---
name: graph-engineering
description: Use when changing the scale-free topology, force layout, BFS activation, canvas projection, pulse heartbeat, idle/rotate/pulse moves, or node-density behavior of sinap-si.
---

# Sinapsi graph engineering procedure

1. Keep topology generation pure: preferential-attachment edges, force layout, and BFS activation order live in `core/graph/`.
2. Neighborhood lighting is hover/click only; there is no public 0–100 `activation` fill.
3. Keep canvas drawing in the renderer service; do not leak 2D context into domain schemas.
4. Drive the frame loop through motion `frame.update` and cancel it on disconnect.
5. Pulse uses the heartbeat compute to compact and expand the whole cloud; rotate tumbles around a random 3D axis that precesses, scaled by a unitless speed multiplier against seconds-per-turn.
6. Invalid semantic `nodes` documents log `[Sinapsi] Invalid … Keeping previous graph.`; never throw from property setters.
7. Test topology and activation with colocated compute suites; exercise the element through public attributes.
8. Document palette, move, speed, and nodes whenever the public contract changes.

Never add a background color token, framework wrapper, or autoplay that starts without a connected host.
