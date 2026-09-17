/** Motion programs `<graph-z>` can run. */
export type GraphzMove = 'idle' | 'rotate' | 'pulse'

/** Color tokens consumed by the renderer. The background is always transparent. */
export type GraphzColorKey = 'primary' | 'text' | 'muted'

export type GraphzPalette = Readonly<Record<GraphzColorKey, string>>

/** Consumer-supplied tokens; omitted or undefined tokens keep the package defaults. */
export type GraphzPaletteOverrides = {
  readonly [Key in GraphzColorKey]?: string | undefined
}

/** Resolved, validated values behind the public attributes of `<graph-z>`. */
export interface GraphzProperties {
  readonly palette: GraphzPalette
  readonly move: GraphzMove
  /** Unitless multiplier applied to every motion program; 1 is the reference pace. */
  readonly speed: number
  /** Rendered node count. */
  readonly nodes: number
  /** Percentage of nodes painted with the primary color, from 0 to 100. */
  readonly activation: number
}
