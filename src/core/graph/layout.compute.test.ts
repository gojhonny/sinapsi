import { describe, expect, it } from 'vitest'

import { layoutForce } from './layout.compute'

describe('core/layout', () => {
  it('places every node in a finite 3D cloud', () => {
    const edges = [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 0 }
    ]
    const points = layoutForce(8, edges, 1, 0.08, 20)

    expect(points).toHaveLength(8)
    expect(points.every((point) => Number.isFinite(point.x + point.y + point.z))).toBe(true)
    expect(points.some((point) => Math.abs(point.z) > 0.05)).toBe(true)
  })
})
