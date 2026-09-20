import { sinapsiConfiguration } from '@core/config.data'
import { createGraph } from '@core/graph/create-graph.compute'
import { createSemanticGraph } from '@core/graph/create-semantic-graph.compute'
import { GraphSceneService } from '@services/scene.service'
import { describe, expect, it } from 'vitest'

describe('service/scene', () => {
  it('keeps decorative graphs muted', () => {
    const scene = new GraphSceneService(createGraph(sinapsiConfiguration.component.defaults.nodes))
    scene.reveal = 1
    const idle = scene.snapshot({ width: 400, height: 400 }, 'idle')
    expect(idle.nodes.every((node) => node.lit === 0 && !node.labeled)).toBe(true)
  })

  it('keeps pulse at rest outside the pulse move', () => {
    const scene = new GraphSceneService(createGraph(12))
    scene.advance(1, 'rotate', 1)
    expect(scene.snapshot({ width: 200, height: 200 }, 'rotate').pulse).toBe(0)
  })

  it('compacts the cloud at pulse rest and expands it at the lub peak', () => {
    const scene = new GraphSceneService(createGraph(48))
    scene.reveal = 1
    const viewport = { width: 400, height: 400 }
    const restSpan = radialSpan(scene.snapshot(viewport, 'idle'))
    const compactSpan = radialSpan(scene.snapshot(viewport, 'pulse'))

    scene.advance(0.12, 'pulse', 1)
    const expandedSpan = radialSpan(scene.snapshot(viewport, 'pulse'))

    expect(compactSpan).toBeLessThan(restSpan)
    expect(expandedSpan).toBeGreaterThan(restSpan)
  })

  it('dims outsiders while emphasizing a semantic neighborhood', () => {
    const scene = new GraphSceneService(
      createSemanticGraph({
        graph: [
          { id: 'a', name: 'A', payload: {}, links: [{ id: 'b', name: 'B' }] },
          { id: 'b', name: 'B', payload: {}, links: [] },
          { id: 'c', name: 'C', payload: {}, links: [] }
        ]
      })
    )
    scene.reveal = 1
    const hover = scene.snapshot({ width: 400, height: 400 }, 'idle', {
      activeId: 'a',
      activeIds: new Set(['a', 'b']),
      selectedId: null,
      labeledIds: new Set(),
      focusedId: null,
      semantic: true
    })
    const hovered = Object.fromEntries(hover.nodes.map((node) => [node.id, node]))

    expect(hovered.a.emphasized).toBe(true)
    expect(hovered.a.labeled).toBe(false)
    expect(hovered.c.dimmed).toBe(true)

    const clicked = scene.snapshot({ width: 400, height: 400 }, 'idle', {
      activeId: 'a',
      activeIds: new Set(['a', 'b']),
      selectedId: 'a',
      labeledIds: new Set(['a', 'b']),
      focusedId: null,
      semantic: true
    })
    const activated = Object.fromEntries(clicked.nodes.map((node) => [node.id, node]))
    expect(activated.a.labeled).toBe(true)
    expect(activated.a.name).toBe('A')
    expect(activated.b.labeled).toBe(true)
    expect(activated.c.labeled).toBe(false)
  })

  it('preserves the semantic lub-dub pulse after fitting while keeping its peak in bounds', () => {
    const scene = new GraphSceneService(
      createSemanticGraph({
        graph: Array.from({ length: 8 }, (_, index) => ({
          id: `node-${index}`,
          name: `Node ${index}`,
          payload: {},
          links: index < 7 ? [{ id: `node-${index + 1}`, name: 'Next' }] : []
        }))
      })
    )
    const viewport = { width: 580, height: 483 }
    const interaction = {
      activeId: null,
      activeIds: new Set<string>(),
      selectedId: null,
      labeledIds: new Set<string>(),
      focusedId: null,
      semantic: true
    }
    const extent = (frame: ReturnType<GraphSceneService['snapshot']>) => {
      const x = frame.nodes.map((node) => node.x)
      const y = frame.nodes.map((node) => node.y)
      return Math.max(
        (Math.max(...x) - Math.min(...x)) / 532,
        (Math.max(...y) - Math.min(...y)) / 435
      )
    }
    const idle = extent(scene.snapshot(viewport, 'idle', interaction))
    const rest = extent(scene.snapshot(viewport, 'pulse', interaction))
    scene.advance(0.12, 'pulse', 1)
    const peak = scene.snapshot(viewport, 'pulse', interaction)
    const lub = extent(peak)
    scene.advance(0.2, 'pulse', 1)
    const dub = extent(scene.snapshot(viewport, 'pulse', interaction))
    expect(idle).toBeCloseTo(1)
    expect(rest).toBeLessThan(dub)
    expect(dub).toBeLessThan(lub)
    expect(lub).toBeCloseTo(1)
    for (const node of peak.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(24 - 1e-8)
      expect(node.x).toBeLessThanOrEqual(556 + 1e-8)
      expect(node.y).toBeGreaterThanOrEqual(24 - 1e-8)
      expect(node.y).toBeLessThanOrEqual(459 + 1e-8)
    }
  })
})

function radialSpan(frame: { nodes: readonly { x: number; y: number }[] }): number {
  return Math.max(...frame.nodes.map((node) => Math.hypot(node.x - 200, node.y - 200)))
}
