import styles from 'virtual:sinapsi-styles'

import type { SinapsiShadowTree } from '@domain/kernel/element.types'
import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'

let instanceCount = 0

export function sinapsiShadowTreeFactory(
  shadowRoot: ShadowRoot,
  document: Document
): SinapsiShadowTree {
  const prefix = `sinapsi-${++instanceCount}`
  const style = document.createElement('style')
  style.textContent = styles

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')

  const listbox = document.createElement('div')
  listbox.className = 'node-list'
  listbox.setAttribute('role', 'listbox')
  listbox.setAttribute('aria-label', 'Graph nodes')
  listbox.tabIndex = 0

  const presentation = document.createElement('div')
  presentation.className = 'presentation'
  presentation.setAttribute('part', 'presentation')
  presentation.setAttribute('role', 'group')
  presentation.id = `${prefix}-presentation`
  presentation.hidden = true

  const close = document.createElement('button')
  close.className = 'presentation-close'
  close.setAttribute('part', 'close')
  close.setAttribute('aria-label', 'Close')
  close.type = 'button'
  close.textContent = '×'

  const content = document.createElement('div')
  content.className = 'presentation-content'
  presentation.append(close, content)

  const live = document.createElement('div')
  live.className = 'live-region'
  live.setAttribute('aria-live', 'polite')
  live.setAttribute('aria-atomic', 'true')

  shadowRoot.append(style, canvas, presentation, live)

  return {
    root: shadowRoot,
    canvas,
    listbox,
    presentation,
    close,
    content,
    live,
    optionId: (index) => `${prefix}-option-${index}`,
    syncSelection(id) {
      for (const option of listbox.children) {
        option.setAttribute('aria-selected', String((option as HTMLElement).dataset.nodeId === id))
      }
    },
    syncOptions(nodesDocument) {
      syncListbox(listbox, canvas, document, nodesDocument, prefix)
    }
  }
}

function syncListbox(
  listbox: HTMLElement,
  canvas: HTMLCanvasElement,
  ownerDocument: Document,
  nodesDocument: SinapsiGraphDocument | null,
  prefix: string
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
    option.id = `${prefix}-option-${index}`
    option.setAttribute('aria-selected', 'false')
    option.dataset.nodeId = node.id
    option.textContent = node.name
    listbox.append(option)
  }

  listbox.tabIndex = nodesDocument.graph.length > 0 ? 0 : -1

  if (!listbox.isConnected) {
    canvas.after(listbox)
  }
}
