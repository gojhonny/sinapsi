import styles from 'virtual:sinapsi-styles'

import type { SinapsiShadowTree } from '@domain/kernel/element.types'
import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'

export function sinapsiShadowTreeFactory(
  shadowRoot: ShadowRoot,
  document: Document
): SinapsiShadowTree {
  const style = document.createElement('style')
  style.textContent = styles

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')

  const listbox = document.createElement('div')
  listbox.className = 'node-list'
  listbox.setAttribute('role', 'listbox')
  listbox.setAttribute('aria-label', 'Graph nodes')
  listbox.tabIndex = 0

  shadowRoot.append(style, canvas)

  return {
    canvas,
    listbox,
    syncOptions(nodesDocument) {
      syncListbox(listbox, canvas, document, nodesDocument)
    }
  }
}

function syncListbox(
  listbox: HTMLElement,
  canvas: HTMLCanvasElement,
  ownerDocument: Document,
  nodesDocument: SinapsiGraphDocument | null
): void {
  listbox.replaceChildren()
  listbox.removeAttribute('aria-activedescendant')

  if (!nodesDocument) {
    listbox.remove()
    return
  }

  for (const [index, node] of nodesDocument.graph.entries()) {
    const option = ownerDocument.createElement('div')
    option.setAttribute('role', 'option')
    option.id = `sinapsi-option-${index}`
    option.dataset.nodeId = node.id
    option.textContent = node.name
    listbox.append(option)
  }

  listbox.tabIndex = nodesDocument.graph.length > 0 ? 0 : -1

  if (!listbox.isConnected) {
    canvas.after(listbox)
  }
}
