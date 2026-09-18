---
name: graph-engineering
description: Use when changing the scale-free topology, force layout, BFS activation, canvas projection, pulse heartbeat, idle/rotate/pulse moves, or node-density behavior of sinap-si.
---

# Sinapsi graph engineering procedure

1. Keep topology generation pure: preferential-attachment edges, force layout, and BFS activation order live in `core/graph/`.
2. Treat `activation` as a 0-100 fill from the highest-degree hub; clamp and recover invalid values at the element boundary.
3. Keep canvas drawing in the renderer service; do not leak 2D context into domain schemas.
4. Drive the frame loop through motion `frame.update` and cancel it on disconnect.
5. Pulse uses the heartbeat compute; rotate tumbles around a random 3D axis that precesses, scaled by a unitless speed multiplier against seconds-per-turn.
6. Nodes above the configured maximum log `[Sinapsi] Invalid …` and clamp; never throw from property setters.
7. Test topology and activation with colocated compute suites; exercise the element through public attributes.
8. Document palette, move, speed, nodes, and activation whenever the public contract changes.

Never add a background color token, framework wrapper, or autoplay that starts without a connected host.
