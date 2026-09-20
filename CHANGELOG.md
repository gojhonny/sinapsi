# Changelog

## 0.2.0

- Add optional per-node `presentation`: HTML cards and compact click-open
  tooltips, with safe text, optional HTTP(S)/relative avatar, reference and badge.
- Keep details anchored to the renderer's final projection during motion,
  resize and scroll. Use a manual popover with an in-host fallback.
- Separate hover/focus preview, selection and open details. Support keyboard,
  touch, explicit closing, localized labels, per-instance announcements and
  focus restoration without modal behavior.
- Fix activation of triangle edges: highlight only edges incident to the active
  node, never an edge merely connecting two of its neighbors.
- Preserve legacy disc labels for nodes without presentation. Configured nodes
  show their content once in the popup, without expanding neighboring discs.
- Preserve graph layout and selection for content-only updates.
- Center semantic topology and fit the final projected bounds to the canvas,
  reducing empty margins while keeping painting, hit testing and details aligned.
  Preserve pulse contraction with headroom for its peak.
- Keep SSR-safe core, browser registration, optional React types and standalone
  distribution; add no framework runtime dependency.
- Allow stable 0.x releases in the release workflow. During the owner's scaffold
  restructuring, CI and release validate package source, types, tests and builds
  explicitly without running agent-folder or repository-audit checks.
