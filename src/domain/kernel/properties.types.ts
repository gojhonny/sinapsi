/** Motion programs `<sinap-si>` can run. */
export type SinapsiMove = 'idle' | 'rotate' | 'pulse'

/** Color tokens consumed by the renderer. The background is always transparent. */
export type SinapsiColorKey = 'primary' | 'text' | 'muted'

export type SinapsiPalette = Readonly<Record<SinapsiColorKey, string>>

/** Consumer-supplied tokens; omitted or undefined tokens keep the package defaults. */
export type SinapsiPaletteOverrides = {
  readonly [Key in SinapsiColorKey]?: string | undefined
}

/** Resolved, validated values behind the public attributes of `<sinap-si>`. */
export interface SinapsiProperties {
  readonly palette: SinapsiPalette
  readonly move: SinapsiMove
  /** Unitless multiplier applied to every motion program; 1 is the reference pace. */
  readonly speed: number
  /** Rendered node count. */
  readonly nodes: number
  /** Percentage of nodes painted with the primary color, from 0 to 100. */
  readonly activation: number
}
