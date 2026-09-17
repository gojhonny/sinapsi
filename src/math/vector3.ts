export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export const vec3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

export const add = (a: Vec3, b: Vec3): Vec3 => vec3(a.x + b.x, a.y + b.y, a.z + b.z);

export const scale = (v: Vec3, factor: number): Vec3 => vec3(v.x * factor, v.y * factor, v.z * factor);

export const length = (v: Vec3): number => Math.hypot(v.x, v.y, v.z);

export const distance = (a: Vec3, b: Vec3): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Uniformly distributed direction on the unit sphere. */
export function randomUnitVector(): Vec3 {
  const z = Math.random() * 2 - 1;
  const angle = Math.random() * Math.PI * 2;
  const ring = Math.sqrt(1 - z * z);
  return vec3(ring * Math.cos(angle), ring * Math.sin(angle), z);
}

export function rotateX(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return vec3(v.x, v.y * cos - v.z * sin, v.y * sin + v.z * cos);
}

export function rotateY(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return vec3(v.x * cos + v.z * sin, v.y, -v.x * sin + v.z * cos);
}
