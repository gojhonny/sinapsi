import { length, scale, vec3 } from '@core/math/vector3.compute'
import type { GraphEdge, Vec3 } from '@domain/kernel/graph.types'

/** 2D force layout flattened onto a disc, matching Obsidian's graph view. */
export function layoutForce(
  nodeCount: number,
  edges: readonly GraphEdge[],
  radius: number,
  flatten: number,
  iterations = 80
): Vec3[] {
  const positions = Array.from({ length: nodeCount }, () => {
    const angle = Math.random() * Math.PI * 2
    const span = Math.sqrt(Math.random()) * radius
    return vec3(Math.cos(angle) * span, Math.sin(angle) * span, 0)
  })
  const k = (radius / Math.sqrt(Math.max(nodeCount, 1))) * 1.75

  for (let step = 0; step < iterations; step++) {
    const cool = (1 - step / iterations) * k
    const displace = Array.from({ length: nodeCount }, () => ({ x: 0, y: 0 }))

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const dist = Math.hypot(dx, dy) + 0.0008
        const force = (k * k) / dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        displace[i].x += fx
        displace[i].y += fy
        displace[j].x -= fx
        displace[j].y -= fy
      }
    }

    for (const { source, target } of edges) {
      const dx = positions[source].x - positions[target].x
      const dy = positions[source].y - positions[target].y
      const dist = Math.hypot(dx, dy) + 0.0008
      const force = (dist * dist) / k
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      displace[source].x -= fx
      displace[source].y -= fy
      displace[target].x += fx
      displace[target].y += fy
    }

    for (let i = 0; i < nodeCount; i++) {
      const mag = Math.hypot(displace[i].x, displace[i].y) || 1
      const limited = Math.min(mag, cool)
      positions[i] = vec3(
        positions[i].x + (displace[i].x / mag) * limited,
        positions[i].y + (displace[i].y / mag) * limited,
        0
      )
    }
  }

  const farthest = Math.max(...positions.map((point) => length(point)), radius)
  return positions.map((point) => {
    const fitted = scale(point, radius / farthest)
    return vec3(fitted.x, fitted.y, (Math.random() * 2 - 1) * radius * flatten)
  })
}
