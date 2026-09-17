import type { SinapsiCameraConfiguration } from '@domain/kernel/config.types'
import type { Vec3 } from '@domain/kernel/graph.types'
import type { ProjectedPoint, Viewport } from '@domain/kernel/render.types'
import { clamp01 } from '@core/math/scalar.compute'

export function project(
  point: Vec3,
  camera: SinapsiCameraConfiguration,
  viewport: Viewport,
  sceneRadius: number
): ProjectedPoint {
  const perspective = camera.focalLength / (camera.distance - point.z)
  const unit = Math.min(viewport.width, viewport.height) * camera.zoom

  return {
    x: viewport.width / 2 + point.x * perspective * unit,
    y: viewport.height / 2 - point.y * perspective * unit,
    depth: clamp01((point.z + sceneRadius) / (2 * sceneRadius))
  }
}
