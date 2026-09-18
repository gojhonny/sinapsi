export const sandboxNodes = {
  graph: [
    {
      id: 'catalog',
      name: 'Catalog',
      payload: { kind: 'catalog', notInOurControl: true },
      links: [
        { id: 'sku-map', name: 'SKU map' },
        { id: 'search', name: 'Search' }
      ]
    },
    {
      id: 'sku-map',
      name: 'SKU map',
      payload: { kind: 'sku' },
      links: [
        { id: 'catalog', name: 'Catalog' },
        { id: 'pricing', name: 'Pricing' }
      ]
    },
    {
      id: 'search',
      name: 'Search',
      payload: { kind: 'search' },
      links: [
        { id: 'catalog', name: 'Catalog' },
        { id: 'ranking', name: 'Ranking' }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing',
      payload: { kind: 'pricing' },
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
