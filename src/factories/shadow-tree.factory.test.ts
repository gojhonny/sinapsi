import styles from 'virtual:sinapsi-styles'
import { describe, expect, it } from 'vitest'

import { sinapsiShadowTreeFactory } from './shadow-tree.factory'

const sample = {
  graph: [
    {
      id: 'cause',
      name: 'Drift cause',
      payload: {},
      links: [{ id: 'pricing', name: 'Pricing' }]
    },
    { id: 'pricing', name: 'Pricing', payload: {}, links: [] }
  ]
}

describe('factory/shadow-tree', () => {
  it('injects the package stylesheet and a decorative canvas', () => {
    const host = document.createElement('div')
    const root = host.attachShadow({ mode: 'open' })
    const tree = sinapsiShadowTreeFactory(root, document)

    expect(tree.canvas.getAttribute('aria-hidden')).toBe('true')
    expect(tree.listbox.isConnected).toBe(false)
    expect(root.querySelector('style')?.textContent).toBe(styles)
  })

  it('places a listbox sibling of the canvas for a semantic document', () => {
    const host = document.createElement('div')
    const root = host.attachShadow({ mode: 'open' })
    const tree = sinapsiShadowTreeFactory(root, document)
    tree.syncOptions(sample)

    expect(tree.canvas.nextElementSibling).toBe(tree.listbox)
    expect(tree.listbox.getAttribute('role')).toBe('listbox')
    expect(
      [...tree.listbox.querySelectorAll('[role="option"]')].map((option) => option.textContent)
    ).toEqual(['Drift cause', 'Pricing'])

    tree.syncOptions(null)
    expect(tree.listbox.isConnected).toBe(false)
  })
})
