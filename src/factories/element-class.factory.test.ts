import { SINAPSI_TAG_NAME } from '@core/config.data'
import type { SinapsiElement } from '@domain/kernel/element.types'
import { defineSinapsi } from '@services/registration.service'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

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
  })

  it('keeps the visual shadow tree closed', () => {
    expect(createGraph().shadowRoot).toBeNull()
  })

  it('exposes rotate, 170 nodes and 0 activation by default', () => {
    const graph = createGraph()
    expect(graph.move).toBe('rotate')
    expect(graph.nodes).toBe(170)
    expect(graph.activation).toBe(0)
    expect(graph.speed).toBe(1)
  })

  it('normalizes invalid attributes, clamps oversized node counts and reports them', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const graph = createGraph()

    graph.setAttribute('move', 'spin')
    graph.setAttribute('nodes', '9000')
    graph.setAttribute('activation', '200')
    graph.setAttribute('color-primary', 'orange')

    expect(graph.move).toBe('rotate')
    expect(graph.getAttribute('move')).toBe('rotate')
    expect(graph.nodes).toBe(400)
    expect(graph.getAttribute('nodes')).toBe('400')
    expect(graph.activation).toBe(0)
    expect(graph.getAttribute('activation')).toBe('0')
    expect(graph.palette.primary).toBe('#F97316')
    expect(error).toHaveBeenCalled()
  })
})
