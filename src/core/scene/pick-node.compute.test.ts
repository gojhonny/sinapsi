import { pickNode } from '@core/scene/pick-node.compute'
import { describe, expect, it } from 'vitest'

describe('core/pick-node', () => {
  it('prefers the nearer node and ignores misses', () => {
    const nodes = [
      { id: 'far', x: 10, y: 10, depth: 0.2, radius: 8 },
      { id: 'near', x: 12, y: 10, depth: 0.9, radius: 8 }
    ]

    expect(pickNode(nodes, 11, 10)).toBe('near')
    expect(pickNode(nodes, 80, 80)).toBeNull()
  })

  it('breaks remaining ties with a stable string id', () => {
    expect(
      pickNode(
        [
          { id: 'b', x: 0, y: 0, depth: 0.5, radius: 4 },
          { id: 'a', x: 0, y: 0, depth: 0.5, radius: 4 }
        ],
        0,
        0
      )
    ).toBe('a')
  })
})
