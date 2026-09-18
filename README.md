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
  <a href="https://github.com/gojhonny/graphz/actions/workflows/ci.yml"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/gojhonny/graphz/ci.yml?branch=main&label=tests&logo=github" height="20"></a>
  <a href="https://www.npmjs.com/package/@neongate-ai/sinapsi"><img alt="npm version" src="https://img.shields.io/npm/v/%40neongate-ai%2Fsinapsi?logo=npm" height="20"></a>
</p>

<p align="center">
  <a href="https://github.com/gojhonny/graphz"><strong>Documentation</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="https://www.npmjs.com/package/@neongate-ai/sinapsi"><strong>npm</strong></a>&nbsp;&nbsp;&nbsp;
  <a href="./LICENSE"><strong>MIT License</strong></a>
</p>

<br>

## Give your UI a living network

`@neongate-ai/sinapsi` is a framework-agnostic, SSR-safe Web Component that
renders a 3D plexus with an Obsidian palette. It exposes one native
`<sinap-si>` element with a transparent host, a three-color palette,
idle/rotate/pulse motion, and BFS activation from the graph hub.

Your application keeps ownership of layout, surrounding UI, and product logic.
Sinapsi does not ship a background token, a persona, or a framework wrapper.

| Capability | What Sinapsi provides |
| --- | --- |
| Native Web Component | One `<sinap-si>` element for React, Next.js, Vue, Svelte, Angular, vanilla JS, and mixed stacks |
| Transparent host | `inline-block` 16rem canvas with no packaged background color |
| Palette | `color-primary`, `color-text`, and `color-muted` |
| Motion | `idle`, `rotate` (default), and `pulse` |
| Density | `nodes` integer from 8 to 400, default 170 |
| Activation | 0–100 BFS fill from the highest-degree hub |
| SSR safety | Core imports do not require browser globals |

<br>

## Install

```bash
npm install @neongate-ai/sinapsi
```

Or:

```bash
pnpm add @neongate-ai/sinapsi
```

<br>

## Quick start

Register `<sinap-si>` from browser-only code:

```ts
import '@neongate-ai/sinapsi/browser'
```

Then use it as a native element:

```html
<sinap-si
  role="img"
  aria-label="Network graph"
  move="rotate"
  nodes="170"
  speed="1"
  activation="40"
  color-primary="#F97316"
  color-text="#F5F5F5"
  color-muted="#A1A1AA"
></sinap-si>
```

For typed JavaScript access:

```ts
import type { SinapsiElement } from '@neongate-ai/sinapsi'
import '@neongate-ai/sinapsi/browser'

const graph = document.querySelector<SinapsiElement>('sinap-si')!

graph.move = 'pulse'
graph.speed = 1.2
graph.nodes = 220
graph.activation = 60
```

<br>

## Web Component API

### HTML attributes

| Attribute | Values | Default | Purpose |
| --- | --- | --- | --- |
| `move` | `idle`, `rotate`, `pulse` | `rotate` | Select the idle animation |
| `speed` | Number in `(0, 10]` | `1` | Scale animation speed |
| `nodes` | Integer 8–400 | `170` | Control graph density |
| `activation` | Number 0–100 | `0` | Fill nodes from the hub in BFS order |
| `color-primary` | CSS color | `#F97316` | Activated node fill |
| `color-text` | CSS color | `#F5F5F5` | Residual strokes and highlights |
| `color-muted` | CSS color | `#A1A1AA` | Inactive node fill |

Invalid attributes log `[Sinapsi] Invalid … Using …` and recover to the default
or a clamped value. `nodes` above 400 logs an error and clamps to 400.

### JavaScript properties

The element reflects the same presentation controls.

| Property | Type / role |
| --- | --- |
| `move` | `idle \| rotate \| pulse` |
| `speed` | Unitless animation multiplier |
| `nodes` | Integer node count |
| `activation` | 0–100 hub fill |
| `palette` | `{ primary, text, muted }` object getter/setter |

<br>

## Motion and activation

`idle` holds the projected graph still. `rotate` tumbles the cloud on a random
3D axis that keeps precessing, so the motion visits every direction. `pulse`
compacts and expands the whole cloud with a heartbeat lub-dub. `speed`
multiplies those motions.

`activation` lights nodes in breadth-first order starting at the highest-degree
hub. At 0 every node is muted; at 100 the graph is fully primary-lit.

<br>

## Palette

The host is transparent. Supply contrast in the surrounding page. Use
`color-primary` for activated nodes, `color-text` for strokes, and
`color-muted` for inactive nodes. There is no `color-background` token.

<br>

## React and Next.js

Import the type augmentation from a client module:

```ts
import '@neongate-ai/sinapsi/react-types'
import '@neongate-ai/sinapsi/browser'
```

Then render:

```tsx
export function NetworkMark() {
  return (
    <sinap-si
      move="rotate"
      nodes={170}
      activation={40}
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
import type { SinapsiElement } from '@neongate-ai/sinapsi'
```

Register the element only inside a browser/client boundary:

```ts
await import('@neongate-ai/sinapsi/browser')
```

If you prefer explicit registration instead of the browser side-effect entry:

```ts
import { defineSinapsi } from '@neongate-ai/sinapsi'

defineSinapsi()
```

`defineSinapsi()` defines `<sinap-si>` once and safely returns without registering
in a non-browser environment.

<br>

## Accessibility

The animated canvas is visual and hidden from assistive technology. The host
element gets its meaning from your application.

- For a meaningful visual identity, provide an appropriate role and accessible name.
- For a decorative graph, hide the host from assistive technology.
- Do not use animation or palette changes as the only way to communicate meaning.

<br>

## Package entry points

| Import | Purpose |
| --- | --- |
| `@neongate-ai/sinapsi` | Types, constants, factories, and explicit registration API |
| `@neongate-ai/sinapsi/browser` | Main API plus automatic browser registration |
| `@neongate-ai/sinapsi/react-types` | React JSX type augmentation |
| `@neongate-ai/sinapsi/standalone` | Direct-browser/CDN bundle |
| `@neongate-ai/sinapsi/index.css` | Explicit stylesheet export |

<br>

## License

[MIT](./LICENSE) © gojhonny
