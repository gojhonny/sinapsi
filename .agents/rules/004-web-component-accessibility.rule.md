---
description: Scopes accessibility, host semantics, closed-shadow canvas, and decorative motion behavior for the native sinaps-i Web Component.
globs:
  - "src/factories/**"
  - "src/services/animation.service.ts"
  - "README.md"
---
# Rule 004: Web Component accessibility

- Effective: 2026-08-21
- Updated: 2026-09-18
- Priority: Critical
- Applies: `<sinaps-i>` behavior and documentation

1. The internal canvas stays `aria-hidden` because it conveys appearance.
   When a valid semantic `nodes` document is showing, a listbox sibling of that
   canvas exposes node names to assistive technology. Decorative mode has no
   listbox.
2. Consumers must be able to label the host when the decorative graph has
   meaning, and must not put the listbox under an `aria-hidden` ancestor.
3. Do not encode meaning only through color or motion in package documentation.
4. Do not place product copy, greetings, personas, or translations in the visual shadow tree.
5. The host stays transparent; page authors supply surrounding contrast.
6. Test accessibility-relevant host behavior without changing the production closed-shadow boundary; focused factory tests may verify generated internal semantics.
