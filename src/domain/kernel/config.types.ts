import type { SinapsiMove, SinapsiPalette } from './properties.types'

export interface SinapsiRange {
  readonly min: number
  readonly max: number
}

export interface SinapsiPropertyDefaults {
  readonly move: SinapsiMove
  readonly speed: number
  readonly nodes: number
}

export interface SinapsiPropertyLimits {
  readonly speed: SinapsiRange
  readonly nodes: SinapsiRange
}

export interface SinapsiComponentConfiguration {
  readonly tagName: string
  readonly defaults: SinapsiPropertyDefaults
  readonly limits: SinapsiPropertyLimits
}

export interface SinapsiShapeConfiguration {
  /** Layout radius of the 3D plexus in scene units. */
  readonly radius: number
  /** Radial noise on the spherical seed, as a fraction of the radius. */
  readonly roughness: number
}

export interface SinapsiGraphConfiguration {
  /** New-node attachments for preferential-attachment (Obsidian-style hubs). */
  readonly neighborsPerNode: number
  readonly shape: SinapsiShapeConfiguration
}

export interface SinapsiJitterConfiguration {
  readonly amplitude: number
  readonly frequency: number
}

export interface SinapsiCameraConfiguration {
  /** Distance from the camera to the scene origin along z. */
  readonly distance: number
  readonly focalLength: number
  /** Fraction of the shorter viewport side used for one scene unit. */
  readonly zoom: number
}

export interface SinapsiMotionConfiguration {
  /** Seconds for one full tumble at speed 1. */
  readonly secondsPerTurn: number
  /** Precession rate as a fraction of spin, so rotate wanders through every axis. */
  readonly tilt: number
  readonly jitter: SinapsiJitterConfiguration
  /** Heartbeat rate of the pulse move at speed 1. */
  readonly beatsPerMinute: number
  /** Radial amplitude around rest size: compact at rest, expand at each peak. */
  readonly pulseScale: number
  readonly revealSeconds: number
  readonly activationSeconds: number
  readonly camera: SinapsiCameraConfiguration
}

/** Shape of `src/sinapsi.config.json` after validation. */
export interface SinapsiConfiguration {
  readonly component: SinapsiComponentConfiguration
  readonly palette: SinapsiPalette
  readonly graph: SinapsiGraphConfiguration
  readonly motion: SinapsiMotionConfiguration
}
