import { clamp01 } from "../math/scalar";
import type { Vec3 } from "../math/vector3";

export interface Camera {
  /** Distance from the camera to the scene origin along z. */
  distance: number;
  focalLength: number;
  /** Fraction of the shorter viewport side used for one scene unit. */
  zoom: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  /** 0 = farthest from the camera, 1 = nearest. */
  depth: number;
}

export function project(point: Vec3, camera: Camera, viewport: Viewport, sceneRadius: number): ProjectedPoint {
  const perspective = camera.focalLength / (camera.distance - point.z);
  const unit = Math.min(viewport.width, viewport.height) * camera.zoom;

  return {
    x: viewport.width / 2 + point.x * perspective * unit,
    y: viewport.height / 2 - point.y * perspective * unit,
    depth: clamp01((point.z + sceneRadius) / (2 * sceneRadius)),
  };
}
