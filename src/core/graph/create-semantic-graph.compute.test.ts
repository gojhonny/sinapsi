import { createSemanticGraph } from '@core/graph/create-semantic-graph.compute'
import { describe, expect, it } from 'vitest'

describe('core/create-semantic-graph', () => {
  it('layouts only supplied links and keeps string keys', () => {
    const graph = createSemanticGraph({
      graph: [
        { id: 'a', name: 'A', payload: {}, links: [{ id: 'b', name: 'B' }] },
        { id: 'b', name: 'B', payload: {}, links: [] }
      ]
    })

    expect(graph.nodes.map((node) => node.key)).toEqual(['a', 'b'])
    expect(graph.nodes.map((node) => node.name)).toEqual(['A', 'B'])
    expect(graph.edges).toEqual([{ source: 0, target: 1 }])
  })

  it('dedupes undirected link pairs', () => {
    const graph = createSemanticGraph({
      graph: [
        { id: 'a', name: 'A', payload: {}, links: [{ id: 'b', name: 'B' }] },
        { id: 'b', name: 'B', payload: {}, links: [{ id: 'a', name: 'A' }] }
      ]
    })

    expect(graph.edges).toEqual([{ source: 0, target: 1 }])
  })

  it('returns an empty graph for an empty document', () => {
    expect(createSemanticGraph({ graph: [] })).toEqual({ nodes: [], edges: [] })
  })
})
