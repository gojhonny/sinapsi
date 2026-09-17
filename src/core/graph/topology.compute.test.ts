import { describe, expect, it } from 'vitest'

import { degrees, preferentialAttachment } from './topology.compute'

describe('core/topology', () => {
  it('grows a connected scale-free graph with busy hubs', () => {
    const edges = preferentialAttachment(16, 2)
    const degree = degrees(edges, 16)

    expect(degree.every((value) => value >= 1)).toBe(true)
    expect(Math.max(...degree)).toBeGreaterThan(Math.min(...degree))
    expect(edges.length).toBeGreaterThanOrEqual(15)
  })
})
