import { nodesDocumentSchema } from '@domain/schemas/nodes.schema'
import { describe, expect, it } from 'vitest'

describe('schema/nodes-document', () => {
  const withPresentation = (presentation: unknown) => ({
    graph: [{ id: 'a', name: 'A', payload: {}, links: [], presentation }]
  })

  it.each([
    { type: 'card', title: 'Title only' },
    { type: 'card', description: 'Description only' },
    { type: 'card', reference: '#record' },
    { type: 'card', badge: '0' },
    { type: 'tooltip', description: 'A compact explanation' }
  ])('accepts a minimal informative presentation: %j', (presentation) => {
    expect(nodesDocumentSchema.parse(withPresentation(presentation)).graph[0].presentation).toEqual(
      presentation
    )
  })

  it('normalizes blank optional fields to absence without creating empty rows', () => {
    const parsed = nodesDocumentSchema.parse(
      withPresentation({
        type: 'card',
        title: '  Title  ',
        description: ' \n ',
        reference: '',
        badge: '  +2 pp ',
        avatarUrl: ' ',
        avatarAlt: '\t'
      })
    )
    expect(parsed.graph[0].presentation).toEqual({ type: 'card', title: 'Title', badge: '+2 pp' })
    expect(
      nodesDocumentSchema.parse(withPresentation({ type: 'tooltip', description: '  Context  ' }))
        .graph[0].presentation
    ).toEqual({ type: 'tooltip', description: 'Context' })
  })

  it.each([
    { type: 'tooltip' },
    { type: 'tooltip', description: ' \t ' },
    { type: 'card' },
    { type: 'card', avatarUrl: '/avatar.webp', avatarAlt: 'Photo' },
    { type: 'card', title: ' ', reference: '\n', badge: '' },
    { type: 'card', badge: -3 },
    { type: 'other', description: 'Cannot reinterpret this' },
    null
  ])('rejects an invalid presentation without inferring another type: %j', (presentation) => {
    expect(nodesDocumentSchema.safeParse(withPresentation(presentation)).success).toBe(false)
  })

  it.each([
    'https://example.com/avatar.webp',
    'http://example.com/a.png',
    '/demo/avatar.webp',
    '../avatar.png',
    'avatar.png',
    '//cdn.example.com/a.webp'
  ])('accepts safe avatar URL %s', (avatarUrl) => {
    expect(
      nodesDocumentSchema.safeParse(withPresentation({ type: 'card', title: 'Title', avatarUrl }))
        .success
    ).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'java\nscript:alert(1)',
    'data:image/svg+xml,<svg></svg>',
    'vbscript:run()',
    'file:///tmp/photo.png',
    'blob:https://example.com/id',
    'ftp://example.com/a.png',
    'https://[broken'
  ])('rejects unsupported or malformed avatar URL %s', (avatarUrl) => {
    expect(
      nodesDocumentSchema.safeParse(withPresentation({ type: 'card', title: 'Title', avatarUrl }))
        .success
    ).toBe(false)
  })

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
