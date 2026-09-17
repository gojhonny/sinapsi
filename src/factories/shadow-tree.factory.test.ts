import styles from 'virtual:sinapsi-styles'
import { describe, expect, it } from 'vitest'

import { sinapsiShadowTreeFactory } from './shadow-tree.factory'

describe('factory/shadow-tree', () => {
  it('injects the package stylesheet and a decorative canvas', () => {
    const host = document.createElement('div')
    const root = host.attachShadow({ mode: 'open' })
    const tree = sinapsiShadowTreeFactory(root, document)

    expect(tree.canvas.getAttribute('aria-hidden')).toBe('true')
    expect(root.querySelector('style')?.textContent).toBe(styles)
  })
})
