import { nodesDocumentSchema } from '@domain/schemas/nodes.schema'
import { describe, expect, it } from 'vitest'

describe('schema/nodes-document', () => {
  it('accepts an empty document and rejects dangling links', () => {
    expect(nodesDocumentSchema.safeParse({ graph: [] }).success).toBe(true)
    expect(
      nodesDocumentSchema.safeParse({
        graph: [
          {
            id: 'a',
            name: 'A',
            payload: {},
            links: [{ id: 'missing', name: 'Missing' }]
          }
        ]
      }).success
    ).toBe(false)
  })

  it('rejects empty names, duplicate ids, self-links, and the old nodes key', () => {
    expect(
      nodesDocumentSchema.safeParse({
        graph: [{ id: 'a', name: '', payload: {}, links: [] }]
      }).success
    ).toBe(false)
    expect(
      nodesDocumentSchema.safeParse({
        graph: [
          { id: 'a', name: 'A', payload: {}, links: [] },
          { id: 'a', name: 'B', payload: {}, links: [] }
        ]
      }).success
    ).toBe(false)
    expect(
      nodesDocumentSchema.safeParse({
        graph: [{ id: 'a', name: 'A', payload: {}, links: [{ id: 'a', name: 'A' }] }]
      }).success
    ).toBe(false)
    expect(nodesDocumentSchema.safeParse({ nodes: [] }).success).toBe(false)
  })
})
