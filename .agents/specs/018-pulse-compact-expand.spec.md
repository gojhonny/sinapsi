# SPEC-018: Pulse compact and expand

- Status: Implemented
- Created: 2026-09-17
- Updated: 2026-09-17
- Mode: Prospective
- Owner: Sinapsi maintainers

## Problem

`move="pulse"` advances a heartbeat envelope, but the renderer only nudges the
radius of activated nodes. The cloud does not compact and expand, so the pulse
move is almost invisible. The repository also still carries a local `references/`
sketch folder that is not part of the package.

## Scope

In scope: pulse scene projection, heartbeat scale mapping, motion docs, and
removal of `references/`.

Out of scope: public attribute changes, rotate/idle motion, npm publication.

## Requirements

1. During `pulse`, the projected graph compact at heartbeat rest and expands at
   each lub-dub peak, using `motion.pulseScale` as the radial amplitude around
   rest size.
2. Idle and rotate keep rest size; pulse intensity stays 0 outside `pulse`.
3. Edges follow the same cloud scale because they are drawn between projected
   nodes.
4. The `references/` directory is not present in the repository.

## Acceptance criteria

- [x] A colocated scene test shows the pulse cloud smaller at rest than idle
      and larger than idle at the lub peak.
- [x] Heartbeat scale maps 0 to `1 - amplitude` and 1 to `1 + amplitude`.
- [x] `references/` is gone; `assets/readme.md` no longer points there.
- [x] README and graph context describe pulse as compact/expand.

## Evidence

`src/core/scene/heartbeat.compute.test.ts`, `src/services/scene.service.test.ts`,
`./cli/graph check`.

## Related records

- ADRs: none (applies unused `pulseScale` in the existing scene pipeline)
- Rules: 005, 003
- Context: `graph-and-activation.md`

## Compatibility and risks

Public attributes are unchanged. SSR, accessibility, and the npm payload are
unaffected. Stronger pulse amplitude can clip nodes near the canvas edge; keep
`pulseScale` as a fraction of rest radius.
