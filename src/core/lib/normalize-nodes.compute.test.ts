import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  parseNodesDocument,
  reportInvalidNodes,
  serializeNodesDocument
} from './normalize-nodes.compute'

const sample = {
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

describe('core/normalize-nodes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('round-trips a valid document and snapshots caller objects', () => {
    const parsed = parseNodesDocument(sample)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) {
      return
    }

    sample.graph[0].name = 'mutated'
    expect(parsed.document.graph[0].name).toBe('Drift cause')
    expect(JSON.parse(serializeNodesDocument(parsed.document))).toEqual({
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
    })
  })

  it('rejects bad JSON, self-links, and oversized documents', () => {
    expect(parseNodesDocument('{')).toEqual({ ok: false })
    expect(
      parseNodesDocument({
        graph: [{ id: 'a', name: 'A', payload: {}, links: [{ id: 'a', name: 'A' }] }]
      })
    ).toEqual({ ok: false })
    expect(
      parseNodesDocument({
        graph: Array.from({ length: 401 }, (_, index) => ({
          id: `n${index}`,
          name: `N${index}`,
          payload: {},
          links: []
        }))
      })
    ).toEqual({ ok: false })
  })

  it('reports invalid nodes without substituting a generated graph', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    reportInvalidNodes('9000')
    expect(error).toHaveBeenCalledWith(
      '[Sinapsi] Invalid nodes=9000: expected a JSON nodes document. Keeping previous graph.'
    )
  })
})
