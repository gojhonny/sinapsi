import { sinapsiConfiguration } from '@core/config.data'
import { createGraph } from '@core/graph/create-graph.compute'
import { GraphSceneService } from '@services/scene.service'
import { describe, expect, it } from 'vitest'

describe('service/scene', () => {
  it('lights nodes in activation order as the percentage grows', () => {
    const scene = new GraphSceneService(createGraph(sinapsiConfiguration.component.defaults.nodes))
    scene.reveal = 1
    scene.activation = 0
    const idle = scene.snapshot({ width: 400, height: 400 }, 'idle')
    expect(idle.nodes.every((node) => node.lit === 0)).toBe(true)

    scene.activation = 100
    const full = scene.snapshot({ width: 400, height: 400 }, 'idle')
    expect(full.nodes.every((node) => node.lit === 1)).toBe(true)
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
})

function radialSpan(frame: { nodes: readonly { x: number; y: number }[] }): number {
  return Math.max(...frame.nodes.map((node) => Math.hypot(node.x - 200, node.y - 200)))
}
