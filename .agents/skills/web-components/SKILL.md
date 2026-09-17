---
name: web-components
description: Use when adding or modifying the native sinap-si element, attributes, properties, lifecycle, closed Shadow DOM, SSR behavior, registration, styling, or animation behavior.
---

# Sinapsi Web Component procedure

1. Specify the native public contract: attribute, property, and reflection behavior.
2. Normalize invalid values at the element boundary through pure core functions and console.error diagnostics.
3. Keep class creation lazy and registration confined to the browser entry.
4. Make connect/disconnect idempotent and dispose the animation frame loop.
5. Keep the shadow root closed and the canvas inaccessible to consumers.
6. Test construction, upgrade, reflection, reconnect, registration idempotence, and SSR import behavior.
7. Document native HTML plus React type integration without adding wrappers.

A new public member requires explicit compatibility review and SPEC evidence.
