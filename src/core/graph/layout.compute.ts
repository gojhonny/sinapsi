import { add, length, scale, vec3 } from '@core/math/vector3.compute'
import type { GraphEdge, Vec3 } from '@domain/kernel/graph.types'

/**
 * Fibonacci sphere, then a short 3D force pass so hubs keep local spokes
 * inside a volumetric plexus (GIF cloud + Obsidian connectivity).
 */
export function layoutForce(
  nodeCount: number,
  edges: readonly GraphEdge[],
  radius: number,
  roughness: number,
  iterations = 55
): Vec3[] {
  const positions = fibonacciSphere(nodeCount, radius, roughness)
  const k = (radius / Math.sqrt(Math.max(nodeCount, 1))) * 1.35

  for (let step = 0; step < iterations; step++) {
    const cool = (1 - step / iterations) * k
    const displace = Array.from({ length: nodeCount }, () => vec3(0, 0, 0))

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const delta = {
          x: positions[i].x - positions[j].x,
          y: positions[i].y - positions[j].y,
          z: positions[i].z - positions[j].z
        }
        const dist = Math.hypot(delta.x, delta.y, delta.z) + 0.0008
        const force = (k * k) / dist
        const push = scale(delta, force / dist)
        displace[i] = add(displace[i], push)
        displace[j] = add(displace[j], scale(push, -1))
      }
    }

    for (const { source, target } of edges) {
      const delta = {
        x: positions[source].x - positions[target].x,
        y: positions[source].y - positions[target].y,
        z: positions[source].z - positions[target].z
      }
      const dist = Math.hypot(delta.x, delta.y, delta.z) + 0.0008
      const force = (dist * dist) / k
      const pull = scale(delta, force / dist)
      displace[source] = add(displace[source], scale(pull, -1))
      displace[target] = add(displace[target], pull)
    }

    for (let i = 0; i < nodeCount; i++) {
      const mag = length(displace[i]) || 1
      const limited = Math.min(mag, cool)
      positions[i] = add(positions[i], scale(displace[i], limited / mag))
    }
  }

  const farthest = Math.max(...positions.map((point) => length(point)), radius)
  return positions.map((point) => scale(point, radius / farthest))
}

function fibonacciSphere(count: number, radius: number, roughness: number): Vec3[] {
  if (count <= 1) {
    return [vec3(0, 0, 0)]
  }

  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * index
    const radial = 1 + (Math.random() * 2 - 1) * roughness
    return vec3(
      Math.cos(theta) * ring * radius * radial,
      y * radius * radial,
      Math.sin(theta) * ring * radius * radial
    )
  })
}
