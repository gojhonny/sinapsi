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

  it('preserves complete presentations through object, JSON, and repeated parse/serialize', () => {
    const document = {
      graph: [
        {
          id: 'card',
          name: 'Record',
          payload: { businessId: 'opaque' },
          links: [{ id: 'tip', name: 'Context' }],
          presentation: {
            type: 'card',
            title: 'A title',
            description: 'A description',
            avatarUrl: '../avatar.webp',
            avatarAlt: 'Profile',
            reference: '#record',
            badge: '-3 drift'
          }
        },
        {
          id: 'tip',
          name: 'Context',
          payload: {},
          links: [],
          presentation: { type: 'tooltip', description: 'Related evidence' }
        },
        {
          id: 'legacy',
          name: 'Legacy',
          payload: { card: { title: 'Not a presentation' } },
          links: []
        }
      ]
    }
    const object = parseNodesDocument(document)
    expect(object.ok).toBe(true)
    if (!object.ok) return
    expect(object.document).toEqual(document)
    const json = parseNodesDocument(serializeNodesDocument(object.document))
    expect(json).toEqual(object)
    const callerPresentation = document.graph[0].presentation
    if (callerPresentation && 'title' in callerPresentation)
      callerPresentation.title = 'Changed by caller'
    expect(object.document.graph[0].presentation).toMatchObject({ title: 'A title' })
    expect(object.document.graph[2]).not.toHaveProperty('presentation')
  })

  it('never prints consumer payloads or presentation text in invalid-document diagnostics', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const invalid = {
      graph: [{ payload: { secret: 'private-payload' }, presentation: { title: 'private-title' } }]
    }
    reportInvalidNodes(invalid)
    reportInvalidNodes(JSON.stringify(invalid))
    expect(error).toHaveBeenCalledTimes(2)
    for (const [message] of error.mock.calls) {
      expect(message).toContain('Keeping previous graph')
      expect(message).not.toContain('private-payload')
      expect(message).not.toContain('private-title')
    }
  })

  it('reports invalid nodes without substituting a generated graph', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    reportInvalidNodes('9000')
    expect(error).toHaveBeenCalledWith(
      '[Sinapsi] Invalid nodes=9000: expected a JSON nodes document. Keeping previous graph.'
    )
  })
})
