import {
  SINAPSI_NODE_CLICK_EVENT,
  SINAPSI_NODE_HOVER_EVENT,
  type SinapsiElement,
  type SinapsiNodeClickEvent,
  type SinapsiNodeHoverEvent
} from '../src/index.ts'
import '../src/browser.client.ts'
import { sandboxNodes } from './nodes.ts'

const graph = document.querySelector<SinapsiElement>('sinaps-i')
const log = document.querySelector<HTMLPreElement>('#event-log')
if (!graph || !log) {
  throw new Error('Missing sinaps-i sandbox host')
}

graph.nodes = sandboxNodes

const bind = (id: string, apply: (value: string) => void): void => {
  const control = document.getElementById(id)
  if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLSelectElement)) {
    throw new Error(`Missing sandbox control: ${id}`)
  }

  control.addEventListener('input', () => apply(control.value))
}

bind('move', (value) => {
  graph.setAttribute('move', value)
})
bind('speed', (value) => {
  graph.setAttribute('speed', value)
})

const writeLog = (label: string, event: SinapsiNodeClickEvent | SinapsiNodeHoverEvent): void => {
  const { id, event: kind, payload } = event.detail
  log.textContent = `${label} (${kind})\n${JSON.stringify({ id, payload }, null, 2)}`
}

graph.addEventListener(SINAPSI_NODE_HOVER_EVENT, (event) => {
  writeLog('sinapsi-node-hover', event as SinapsiNodeHoverEvent)
})
graph.addEventListener(SINAPSI_NODE_CLICK_EVENT, (event) => {
  writeLog('sinapsi-node-click', event as SinapsiNodeClickEvent)
})
