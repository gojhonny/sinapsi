<p align="center">
  <img
    src="./assets/images/sinapsi-tagline.svg"
    alt="One native network-graph component for every web stack."
  >
</p>

<p align="center">
  <img src="./assets/images/readme-banner.png" alt="Sinapsi network graph component" width="100%">
</p>

<p align="center">
  <a href="https://paladini.io/harness-score/guide/maturity-model.html"><img alt="Harness Score L4" src="https://paladini.github.io/harness-score/maturity/badge-l4.svg" height="20"></a>
  <a href="https://github.com/gojhonny/sinapsi/actions/workflows/ci.yml"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/gojhonny/sinapsi/ci.yml?branch=main&label=tests&logo=github" height="20"></a>
  <a href="https://www.npmjs.com/package/sinapsi"><img alt="npm version" src="https://img.shields.io/npm/v/sinapsi?logo=npm" height="20"></a>
</p>

<p align="center">
  <a href="https://github.com/gojhonny/sinapsi"><strong>Documentation</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.npmjs.com/package/sinapsi"><strong>npm</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="./LICENSE"><strong>MIT License</strong></a>
</p>

<br>

## Give your UI a living network

`sinapsi` is a framework-agnostic, SSR-safe Web Component that
renders a 3D plexus with an Obsidian palette. It exposes one native
`<sinaps-i>` element with a transparent host, a three-color palette,
idle/rotate/pulse motion, and optional semantic JSON nodes.

Your application keeps ownership of layout, surrounding UI, and product logic.
Sinapsi does not ship a background token, a persona, or a framework wrapper.

| Capability | What Sinapsi provides |
| --- | --- |
| Native Web Component | One `<sinaps-i>` element for React, Next.js, Vue, Svelte, Angular, vanilla JS, and mixed stacks |
| Transparent host | `inline-block` 16rem canvas with no packaged background color |
| Palette | `color-primary`, `color-text`, and `color-muted` |
| Motion | `idle`, `rotate` (default), and `pulse`; pointer-over freezes as idle |
| Nodes | Omit `nodes` for a generated decorative graph; pass `{ "graph": SinapsiNode[] }` for semantic ids, links, hover, and click |
| Neighborhood lighting | Hover and click light the undirected one-level neighborhood; click draws each `name` inside those discs |
| SSR safety | Core imports do not require browser globals |

<br>

## Install

```bash
npm install sinapsi
```

Or:

```bash
pnpm add sinapsi
```

<br>

## Quick start

Register `<sinaps-i>` from browser-only code:

```ts
import 'sinapsi/browser'
```

Then use it as a native element:

```html
<sinaps-i
  role="img"
  aria-label="Network graph"
  move="rotate"
  speed="1"
  color-primary="#F97316"
  color-text="#F5F5F5"
  color-muted="#A1A1AA"
></sinaps-i>
```

For typed JavaScript access:

```ts
import type { SinapsiElement } from 'sinapsi'
import 'sinapsi/browser'

const graph = document.querySelector<SinapsiElement>('sinaps-i')!

graph.move = 'pulse'
graph.speed = 1.2
graph.nodes = {
  graph: [
    {
      id: 'cause',
      name: 'Drift cause',
      payload: { kind: 'cause' },
      links: [{ id: 'pricing', name: 'Pricing' }]
    },
    {
      id: 'pricing',
      name: 'Pricing',
      payload: { kind: 'pricing' },
      links: [{ id: 'cause', name: 'Drift cause' }]
    }
  ]
}
```

<br>

## Web Component API

### HTML attributes

| Attribute | Values | Default | Purpose |
| --- | --- | --- | --- |
| `move` | `idle`, `rotate`, `pulse` | `rotate` | Select the idle animation |
| `speed` | Number in `(0, 10]` | `1` | Scale animation speed |
| `nodes` | JSON `{ "graph": SinapsiNode[] }` | omitted | Semantic graph; omit for the generated decorative graph |
| `color-primary` | CSS color | `#F97316` | Neighborhood node fill |
| `color-text` | CSS color | `#F5F5F5` | In-disc names and residual highlights |
| `color-muted` | CSS color | `#A1A1AA` | Inactive node fill |

Invalid `move`, `speed`, and color attributes log
`[Sinapsi] Invalid … Using …` and recover to the default or a clamped value.
Invalid `nodes` JSON logs `[Sinapsi] Invalid nodes … Keeping previous graph.`
and does not apply a partial document.

### JavaScript properties

The element reflects the same presentation controls.

| Property | Type / role |
| --- | --- |
| `move` | `idle \| rotate \| pulse` |
| `speed` | Unitless animation multiplier |
| `nodes` | Last accepted `{ graph: SinapsiNode[] }` snapshot, or `null` when decorative. Setter accepts that document or its JSON string. |
| `palette` | `{ primary, text, muted }` object getter/setter |

Each semantic node is `{ id, name, payload, links }`. `links` are
`{ id, name }` objects whose `id` names another node in the same document
(0–400 nodes). `payload` is an opaque object and may be `{}`. The property
getter returns a snapshot; mutating the object you passed in does not change
the live graph.

`parseNodesDocument` / `serializeNodesDocument` are the Zod parse/stringify
transformers. Layout uses only `link.id` as undirected edges.

Hovering a semantic node highlights it, its one-level neighbors (including
inbound reverse links), and the connecting edges. Clicking it activates that
neighborhood until another node is clicked and draws each `name` centered
inside those discs. Hover and click always dispatch `sinapsi-node-hover` or
`sinapsi-node-click`:

```ts
graph.addEventListener('sinapsi-node-click', (event) => {
  const { id, event: kind, payload } = event.detail
  console.log(id, kind, payload)
})
```

Events bubble and compose from the host. Detail is
`{ id, event: 'click' | 'hover', payload }`. Programmatic `nodes` writes do
not emit. Empty space does not emit and does not clear the click neighborhood.
Pointer-over the host freezes rotate/pulse as idle without writing `move`.

<br>

## Motion and activation

`idle` holds the projected graph still. `rotate` tumbles the cloud on a random
3D axis that keeps precessing, so the motion visits every direction. `pulse`
compacts and expands the whole cloud with a heartbeat lub-dub. `speed`
multiplies those motions.

There is no public `activation` fill. Decorative omitted-`nodes` graphs stay
muted. A semantic document lights the hovered or clicked one-level
neighborhood, including connecting edges. Click also paints `node.name`
inside every activated disc. Node discs are never stroked.

<br>

## Palette

The host is transparent. Supply contrast in the surrounding page. Use
`color-primary` for neighborhood nodes, `color-text` for in-disc names, and
`color-muted` for inactive nodes. There is no `color-background` token.

<br>

## React and Next.js

Import the type augmentation from a client module:

```ts
import 'sinapsi/react-types'
import 'sinapsi/browser'
```

Then render:

```tsx
export function NetworkMark() {
  return (
    <sinaps-i
      move="rotate"
      color-primary="#F97316"
      aria-label="Network graph"
    />
  )
}
```

`className` cannot style the closed shadow tree. Wrap the host when you need
page-layout styling.

<br>

## SSR and browser registration

The core package is safe to import when `HTMLElement` and `customElements` are
not available:

```ts
import type { SinapsiElement } from 'sinapsi'
```

Register the element only inside a browser/client boundary:

```ts
await import('sinapsi/browser')
```

If you prefer explicit registration instead of the browser side-effect entry:

```ts
import { defineSinapsi } from 'sinapsi'

defineSinapsi()
```

`defineSinapsi()` defines `<sinaps-i>` once and safely returns without registering
in a non-browser environment.

<br>

## Accessibility

The animated canvas stays `aria-hidden`. When a valid semantic `nodes`
document is showing, a visually hidden listbox sibling exposes node names:
one tab stop, arrow keys move, Enter or Space activates the click path.
Decorative mode has no listbox.

- For a meaningful visual identity, provide an appropriate role and accessible name.
- For a decorative graph, hide the host from assistive technology.
- Do not use animation or palette changes as the only way to communicate meaning.
- Do not put the semantic listbox under an `aria-hidden` ancestor.

<br>

## Package entry points

| Import | Purpose |
| --- | --- |
| `sinapsi` | Types, constants, factories, and explicit registration API |
| `sinapsi/browser` | Main API plus automatic browser registration |
| `sinapsi/react-types` | React JSX type augmentation |
| `sinapsi/standalone` | Direct-browser/CDN bundle |
| `sinapsi/index.css` | Explicit stylesheet export |

<br>

## License

[MIT](./LICENSE) © gojhonny
