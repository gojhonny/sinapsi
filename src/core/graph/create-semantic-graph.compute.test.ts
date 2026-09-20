import { sinapsiConfiguration } from '@core/config.data'
import { createSemanticGraph } from '@core/graph/create-semantic-graph.compute'
import { length } from '@core/math/vector3.compute'
import { GraphSceneService } from '@services/scene.service'
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

  it('centers and fits a dense semantic layout to the configured radius once', () => {
    const graph = createSemanticGraph({
      graph: Array.from({ length: 12 }, (_, index) => ({
        id: `node-${index}`,
        name: `Node ${index}`,
        payload: {},
        links: Array.from({ length: 11 - index }, (_, offset) => ({
          id: `node-${index + offset + 1}`,
          name: 'Connection'
        }))
      }))
    })
    const positions = graph.nodes.map((node) => node.position)
    expect(Math.max(...positions.map(length))).toBeCloseTo(
      sinapsiConfiguration.graph.shape.radius,
      10
    )
    for (const axis of ['x', 'y', 'z'] as const) {
      expect(
        Math.min(...positions.map((point) => point[axis])) +
          Math.max(...positions.map((point) => point[axis]))
      ).toBeCloseTo(0, 10)
    }
    const scene = new GraphSceneService(graph)
    const originalPositions = graph.nodes.map((node) => node.position)
    for (let step = 0; step < 40; step++) {
      scene.advance(0.25, 'rotate', 1)
      const frame = scene.snapshot({ width: 600, height: 420 }, 'rotate', {
        activeId: null,
        activeIds: new Set(),
        selectedId: null,
        labeledIds: new Set(),
        focusedId: null,
        semantic: true
      })
      for (const point of frame.nodes) {
        expect(point.x).toBeGreaterThanOrEqual(24 - 1e-8)
        expect(point.x).toBeLessThanOrEqual(576 + 1e-8)
        expect(point.y).toBeGreaterThanOrEqual(24 - 1e-8)
        expect(point.y).toBeLessThanOrEqual(396 + 1e-8)
      }
      const spanX =
        Math.max(...frame.nodes.map((node) => node.x)) -
        Math.min(...frame.nodes.map((node) => node.x))
      const spanY =
        Math.max(...frame.nodes.map((node) => node.y)) -
        Math.min(...frame.nodes.map((node) => node.y))
      expect(Math.max(spanX / 552, spanY / 372)).toBeCloseTo(1, 10)
    }
    expect(graph.nodes.map((node) => node.position)).toEqual(originalPositions)
  })

  it('keeps a single-node layout finite and centered without dividing by zero', () => {
    const graph = createSemanticGraph({
      graph: [{ id: 'one', name: 'One', payload: {}, links: [] }]
    })
    expect(graph.nodes[0].position).toEqual({ x: 0, y: 0, z: 0 })
  })
})
