---
description: Scopes accessibility, host semantics, closed-shadow canvas, and decorative motion behavior for the native sinap-si Web Component.
globs:
  - "src/factories/**"
  - "src/services/animation.service.ts"
  - "README.md"
---
# Rule 004: Web Component accessibility

- Effective: 2026-08-21
- Priority: Critical
- Applies: `<sinap-si>` behavior and documentation

1. The internal visual tree remains hidden from assistive technology because it conveys appearance, not content.
2. Consumers must be able to label the host when the graph has semantic meaning.
3. Do not encode meaning only through color or motion in package documentation.
4. Do not place product copy, greetings, personas, or translations in the visual shadow tree.
5. The host stays transparent; page authors supply surrounding contrast.
6. Test accessibility-relevant host behavior without changing the production closed-shadow boundary; focused factory tests may verify generated internal semantics.
