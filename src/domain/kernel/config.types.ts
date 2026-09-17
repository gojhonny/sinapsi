import type { GraphzMove, GraphzPalette } from './properties.types'

export interface GraphzRange {
  readonly min: number
  readonly max: number
}

export interface GraphzPropertyDefaults {
  readonly move: GraphzMove
  readonly speed: number
  readonly nodes: number
  readonly activation: number
}

export interface GraphzPropertyLimits {
  readonly speed: GraphzRange
  readonly nodes: GraphzRange
  readonly activation: GraphzRange
}

export interface GraphzComponentConfiguration {
  readonly tagName: string
  readonly defaults: GraphzPropertyDefaults
  readonly limits: GraphzPropertyLimits
}

export interface GraphzShapeConfiguration {
  /** Base radius of the point cloud in scene units. */
  readonly radius: number
  /** Depth of the smooth, low-frequency bumps as a fraction of the radius. */
  readonly lobeDepth: number
  /** Per-point random radial noise as a fraction of the radius. */
  readonly roughness: number
}

export interface GraphzGraphConfiguration {
  readonly neighborsPerNode: number
  readonly shape: GraphzShapeConfiguration
}

export interface GraphzJitterConfiguration {
  readonly amplitude: number
  readonly frequency: number
}

export interface GraphzCameraConfiguration {
  /** Distance from the camera to the scene origin along z. */
  readonly distance: number
  readonly focalLength: number
  /** Fraction of the shorter viewport side used for one scene unit. */
  readonly zoom: number
}

export interface GraphzMotionConfiguration {
  /** Seconds for one full turn around the vertical axis at speed 1. */
  readonly secondsPerTurn: number
  /** Rotation around x as a fraction of the rotation around y. */
  readonly tilt: number
  readonly jitter: GraphzJitterConfiguration
  /** Heartbeat rate of the pulse move at speed 1. */
  readonly beatsPerMinute: number
  /** Maximum scale added at the peak of a heartbeat. */
  readonly pulseScale: number
  readonly revealSeconds: number
  readonly activationSeconds: number
  readonly camera: GraphzCameraConfiguration
}

/** Shape of `src/graphz.config.json` after validation. */
export interface GraphzConfiguration {
  readonly component: GraphzComponentConfiguration
  readonly palette: GraphzPalette
  readonly graph: GraphzGraphConfiguration
  readonly motion: GraphzMotionConfiguration
}
