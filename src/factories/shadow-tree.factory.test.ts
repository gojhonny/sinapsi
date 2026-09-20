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

  it('uses unique option and presentation IDs, with nonmodal details outside the listbox', () => {
    const one = sinapsiShadowTreeFactory(
      document.createElement('div').attachShadow({ mode: 'open' }),
      document
    )
    const two = sinapsiShadowTreeFactory(
      document.createElement('div').attachShadow({ mode: 'open' }),
      document
    )
    one.syncOptions(sample)
    two.syncOptions(sample)
    expect(one.optionId(0)).not.toBe(two.optionId(0))
    expect(one.presentation.id).not.toBe(two.presentation.id)
    expect(one.presentation.getAttribute('role')).toBe('group')
    expect(one.presentation.hasAttribute('aria-modal')).toBe(false)
    expect(one.presentation.hidden).toBe(true)
    expect(one.listbox.contains(one.close)).toBe(false)
    expect(one.close.getAttribute('aria-label')).toBe('Close')
    one.syncSelection('cause')
    expect(one.listbox.children[0].getAttribute('aria-selected')).toBe('true')
    expect(one.listbox.children[1].getAttribute('aria-selected')).toBe('false')
  })
})
