import { describe, expect, it } from 'vitest'

import { layoutForce } from './layout.compute'

describe('core/layout', () => {
  it('places every node on a finite flattened disc', () => {
    const edges = [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 0 }
    ]
    const points = layoutForce(3, edges, 1, 0.1, 20)

    expect(points).toHaveLength(3)
    expect(points.every((point) => Number.isFinite(point.x + point.y + point.z))).toBe(true)
  })
})
