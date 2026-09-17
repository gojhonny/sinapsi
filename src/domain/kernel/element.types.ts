import type { SinapsiMove, SinapsiPalette, SinapsiPaletteOverrides } from './properties.types'

/**
 * Public surface of `<sinap-si>`. Attributes are the source of truth: getters
 * read and normalize them, setters write normalized values back.
 */
export interface SinapsiElement extends HTMLElement {
  get palette(): SinapsiPalette
  set palette(value: SinapsiPaletteOverrides | null | undefined)
  get move(): SinapsiMove
  set move(value: SinapsiMove | null | undefined)
  get speed(): number
  set speed(value: number | null | undefined)
  get nodes(): number
  set nodes(value: number | null | undefined)
  get activation(): number
  set activation(value: number | null | undefined)
}

export type SinapsiElementConstructor = CustomElementConstructor & {
  new (): SinapsiElement
  readonly observedAttributes: readonly string[]
  readonly prototype: SinapsiElement
}

/** Visual internals created inside the closed shadow root. */
export interface SinapsiShadowTree {
  readonly canvas: HTMLCanvasElement
}
