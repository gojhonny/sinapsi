import type { GraphEdge } from './graph.types'

export interface Viewport {
  readonly width: number
  readonly height: number
}

export interface ProjectedPoint {
  readonly x: number
  readonly y: number
  /** 0 is farthest from the camera, 1 is nearest. */
  readonly depth: number
}

export interface RenderNode extends ProjectedPoint {
  readonly weight: number
  /** 0 paints the text color, 1 paints the primary color; in between blends the two. */
  readonly lit: number
}

/** Everything the renderer needs for one frame, already projected to screen space. */
export interface RenderFrame {
  readonly nodes: readonly RenderNode[]
  readonly edges: readonly GraphEdge[]
  /** Intro progress from 0 to 1: edges grow in and nodes fade in. */
  readonly reveal: number
  /** Heartbeat intensity from 0 to 1; stays 0 outside the pulse move. */
  readonly pulse: number
}
