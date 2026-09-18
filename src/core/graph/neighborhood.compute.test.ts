import { neighborhoodIds } from '@core/graph/neighborhood.compute'
import { describe, expect, it } from 'vitest'

describe('core/neighborhood', () => {
  it('includes reverse links in the one-level neighborhood', () => {
    const ids = neighborhoodIds(
      {
        graph: [
          { id: 'a', name: 'A', payload: {}, links: [{ id: 'b', name: 'B' }] },
          { id: 'b', name: 'B', payload: {}, links: [] },
          { id: 'c', name: 'C', payload: {}, links: [] }
        ]
      },
      'b'
    )

    expect([...ids].sort()).toEqual(['a', 'b'])
  })
})
