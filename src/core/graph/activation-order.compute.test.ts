import { describe, expect, it } from 'vitest'

import { activationOrder } from './activation-order.compute'
import { degrees } from './topology.compute'

describe('core/activation-order', () => {
  it('starts at the highest-degree node and spreads along edges', () => {
    const edges = [
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 0, target: 3 },
      { source: 1, target: 4 }
    ]
    const degree = degrees(edges, 5)

    expect(activationOrder(edges, degree)[0]).toBe(0)
    expect(activationOrder(edges, degree).slice(-1)[0]).toBe(4)
  })
})
