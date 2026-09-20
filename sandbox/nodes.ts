import type { SinapsiGraphDocument } from '../src/index.ts'

export const sandboxNodes: SinapsiGraphDocument = {
  graph: [
    {
      id: 'catalog',
      name: 'Catalog',
      payload: { kind: 'catalog', notInOurControl: true },
      presentation: {
        type: 'card',
        avatarUrl: '/avatar.svg',
        avatarAlt: 'Illustrative profile',
        title: 'Anna Souza',
        description: 'Refactor drift scoring',
        reference: '#a8f3c2d',
        badge: '-3 drift'
      },
      links: [
        { id: 'sku-map', name: 'SKU map' },
        { id: 'search', name: 'Search' }
      ]
    },
    {
      id: 'sku-map',
      name: 'SKU map',
      payload: { kind: 'sku' },
      presentation: {
        type: 'card',
        title: 'Catalog mapping',
        description: 'A generic card without an avatar. Product identifiers now share one mapping.',
        reference: 'CAT-42',
        badge: 'Review'
      },
      links: [
        { id: 'catalog', name: 'Catalog' },
        { id: 'pricing', name: 'Pricing' }
      ]
    },
    {
      id: 'search',
      name: 'Search',
      payload: { kind: 'search' },
      presentation: {
        type: 'tooltip',
        description:
          'Search results link back to the catalog. This compact presentation opens only on activation.'
      },
      links: [
        { id: 'catalog', name: 'Catalog' },
        { id: 'ranking', name: 'Ranking' }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing',
      payload: { kind: 'pricing' },
      presentation: {
        type: 'card',
        description: 'Description-only cards need no title or avatar.'
      },
      links: [{ id: 'sku-map', name: 'SKU map' }]
    },
    {
      id: 'ranking',
      name: 'Ranking',
      payload: { kind: 'ranking' },
      links: [{ id: 'search', name: 'Search' }]
    }
  ]
}
