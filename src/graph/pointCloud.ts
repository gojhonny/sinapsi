import { randomUnitVector, scale, type Vec3 } from "../math/vector3";

export interface ShapeConfig {
  radius: number;
  /** Depth of the smooth, low-frequency bumps (fraction of radius). */
  lobeDepth: number;
  /** Per-point random radial noise (fraction of radius). */
  roughness: number;
}

/** Low-frequency bumps so the cloud reads as one organic blob instead of a perfect sphere. */
function lobeOffset(direction: Vec3): number {
  return (
    Math.sin(direction.x * 3.1 + 0.6) *
    Math.sin(direction.y * 2.3 - 1.2) *
    Math.cos(direction.z * 2.7 + 0.4)
  );
}

function surfaceRadius(direction: Vec3, shape: ShapeConfig): number {
  const lobes = lobeOffset(direction) * shape.lobeDepth;
  const grain = (Math.random() * 2 - 1) * shape.roughness;
  return shape.radius * (1 + lobes + grain);
}

export function createPointCloud(count: number, shape: ShapeConfig): Vec3[] {
  return Array.from({ length: count }, () => {
    const direction = randomUnitVector();
    return scale(direction, surfaceRadius(direction, shape));
  });
}
