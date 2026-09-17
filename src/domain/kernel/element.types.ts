import type { GraphzMove, GraphzPalette, GraphzPaletteOverrides } from './properties.types'

/**
 * Public surface of `<graph-z>`. Attributes are the source of truth: getters
 * read and normalize them, setters write normalized values back.
 */
export interface GraphzElement extends HTMLElement {
  get palette(): GraphzPalette
  set palette(value: GraphzPaletteOverrides | null | undefined)
  get move(): GraphzMove
  set move(value: GraphzMove | null | undefined)
  get speed(): number
  set speed(value: number | null | undefined)
  get nodes(): number
  set nodes(value: number | null | undefined)
  get activation(): number
  set activation(value: number | null | undefined)
}

export type GraphzElementConstructor = CustomElementConstructor & {
  new (): GraphzElement
  readonly observedAttributes: readonly string[]
  readonly prototype: GraphzElement
}

/** Visual internals created inside the closed shadow root. */
export interface GraphzShadowTree {
  readonly canvas: HTMLCanvasElement
}
