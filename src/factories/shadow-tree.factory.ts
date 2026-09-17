import styles from 'virtual:sinapsi-styles'

import type { SinapsiShadowTree } from '@domain/kernel/element.types'

export function sinapsiShadowTreeFactory(shadowRoot: ShadowRoot, document: Document): SinapsiShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')

  shadowRoot.append(style, canvas)

  return { canvas }
}
