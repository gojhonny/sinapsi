import { SINAPSI_TAG_NAME } from '@core/config.data'
import { serializeNodesDocument } from '@core/lib/normalize-nodes.compute'
import type { SinapsiElement } from '@domain/kernel/element.types'
import {
  SINAPSI_NODE_CLICK_EVENT,
  SINAPSI_NODE_HOVER_EVENT,
  type SinapsiGraphDocument,
  type SinapsiNodeClickEvent,
  type SinapsiNodeHoverEvent
} from '@domain/kernel/nodes.types'
import { GraphAnimationService } from '@services/animation.service'
import { defineSinapsi } from '@services/registration.service'
import { CanvasRendererService } from '@services/renderer.service'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const sample: SinapsiGraphDocument = {
  graph: [
    {
      id: 'cause',
      name: 'Drift cause',
      payload: { kind: 'cause' },
      links: [{ id: 'pricing', name: 'Pricing' }]
    },
    {
      id: 'pricing',
      name: 'Pricing',
      payload: { kind: 'pricing' },
      links: [{ id: 'cause', name: 'Drift cause' }]
    }
  ]
}

interface MutableGraphDocument {
  graph: Array<{
    id: string
    name: string
    payload: Record<string, unknown>
    links: Array<{ id: string; name: string }>
  }>
}

function asMutable(document: SinapsiGraphDocument): MutableGraphDocument {
  return structuredClone(document) as MutableGraphDocument
}

function createGraph(): SinapsiElement {
  const element = document.createElement(SINAPSI_TAG_NAME) as SinapsiElement
  document.body.append(element)
  return element
}

describe('factory/element-class', () => {
  beforeAll(() => {
    defineSinapsi()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it('keeps the visual shadow tree closed', () => {
    expect(createGraph().shadowRoot).toBeNull()
  })

  it('omits nodes by default and does not observe activation', () => {
    const graph = createGraph()
    expect(graph.move).toBe('rotate')
    expect(graph.nodes).toBeNull()
    expect(graph.getAttribute('nodes')).toBeNull()
    expect(graph.getAttribute('activation')).toBeNull()
    expect(graph.speed).toBe(1)
    expect(graph.constructor).toHaveProperty('observedAttributes')
    expect(
      (graph.constructor as unknown as { observedAttributes: readonly string[] }).observedAttributes
    ).not.toContain('activation')
  })

  it('accepts a graph document, snapshots it, and keeps previous on invalid JSON', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const graph = createGraph()
    const input = asMutable(sample)
    graph.nodes = input
    input.graph[0].name = 'mutated'

    expect(graph.nodes).toEqual(sample)
    expect(graph.getAttribute('nodes')).toBe(serializeNodesDocument(sample))

    const snapshot = graph.nodes as unknown as MutableGraphDocument | null
    expect(snapshot).not.toBeNull()
    if (!snapshot) {
      return
    }
    snapshot.graph[0].name = 'from getter'
    expect(graph.nodes).toEqual(sample)

    graph.setAttribute('nodes', '9000')
    expect(graph.nodes).toEqual(sample)
    expect(graph.getAttribute('nodes')).toBe(serializeNodesDocument(sample))
    expect(error).toHaveBeenCalledWith(
      '[Sinapsi] Invalid nodes=9000: expected a JSON nodes document. Keeping previous graph.'
    )
  })

  it('normalizes invalid move without rewriting nodes to a density integer', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const graph = createGraph()

    graph.setAttribute('move', 'spin')
    graph.setAttribute('color-primary', 'orange')

    expect(graph.move).toBe('rotate')
    expect(graph.getAttribute('move')).toBe('rotate')
    expect(graph.nodes).toBeNull()
    expect(graph.palette.primary).toBe('#F97316')
    expect(error).toHaveBeenCalled()
  })

  it('freezes motion as idle on host hover without writing move', () => {
    const frozen = vi.spyOn(GraphAnimationService.prototype, 'setFrozen')
    const graph = createGraph()
    graph.move = 'rotate'
    frozen.mockClear()

    graph.dispatchEvent(new Event('pointerenter'))
    expect(graph.move).toBe('rotate')
    expect(frozen).toHaveBeenCalledTimes(1)
    expect(frozen).toHaveBeenCalledWith(true)

    graph.remove()
    document.body.append(graph)
    frozen.mockClear()
    graph.dispatchEvent(new Event('pointerenter'))
    expect(frozen).toHaveBeenCalledTimes(1)
  })

  it('always dispatches hover once per enter and click on pointerup', () => {
    vi.spyOn(CanvasRendererService.prototype, 'pick').mockReturnValue('pricing')
    const graph = createGraph()
    const hover: SinapsiNodeHoverEvent[] = []
    const click: SinapsiNodeClickEvent[] = []
    graph.addEventListener(SINAPSI_NODE_HOVER_EVENT, (event) => {
      hover.push(event as SinapsiNodeHoverEvent)
    })
    graph.addEventListener(SINAPSI_NODE_CLICK_EVENT, (event) => {
      click.push(event as SinapsiNodeClickEvent)
    })
    graph.nodes = sample

    expect(hover).toEqual([])
    expect(click).toEqual([])

    graph.dispatchEvent(new PointerEvent('pointermove', { clientX: 8, clientY: 8 }))
    graph.dispatchEvent(new PointerEvent('pointermove', { clientX: 9, clientY: 8 }))
    expect(hover).toHaveLength(1)
    expect(hover[0].detail).toEqual({
      id: 'pricing',
      event: 'hover',
      payload: { kind: 'pricing' }
    })
    expect(hover[0].bubbles).toBe(true)
    expect(hover[0].composed).toBe(true)

    graph.dispatchEvent(new PointerEvent('pointerdown', { clientX: 8, clientY: 8 }))
    graph.dispatchEvent(new PointerEvent('pointerup', { clientX: 8, clientY: 8 }))
    expect(click).toHaveLength(1)
    expect(click[0].detail).toEqual({
      id: 'pricing',
      event: 'click',
      payload: { kind: 'pricing' }
    })
  })

  it('does not activate on a miss or a drag past the click slop', () => {
    const activate = vi.spyOn(GraphAnimationService.prototype, 'activateNeighborhood')
    const pick = vi.spyOn(CanvasRendererService.prototype, 'pick')
    const graph = createGraph()
    graph.nodes = sample

    pick.mockReturnValue(null)
    graph.dispatchEvent(new PointerEvent('pointerdown', { clientX: 1, clientY: 1 }))
    graph.dispatchEvent(new PointerEvent('pointerup', { clientX: 1, clientY: 1 }))
    expect(activate).not.toHaveBeenCalled()

    pick.mockReturnValue('cause')
    graph.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }))
    graph.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, clientY: 10 }))
    expect(activate).not.toHaveBeenCalled()
  })
})
