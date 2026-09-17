import type { SinapsiElement } from '../src/index.ts'
import '../src/browser.client.ts'

const graph = document.querySelector<SinapsiElement>('sinap-si')
if (!graph) {
  throw new Error('Missing sinap-si demo host')
}

const bind = (id: string, apply: (value: string) => void): void => {
  const control = document.getElementById(id)
  if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLSelectElement)) {
    throw new Error(`Missing demo control: ${id}`)
  }

  control.addEventListener('input', () => apply(control.value))
}

bind('move', (value) => {
  graph.setAttribute('move', value)
})
bind('nodes', (value) => {
  graph.setAttribute('nodes', value)
})
bind('speed', (value) => {
  graph.setAttribute('speed', value)
})
bind('activation', (value) => {
  graph.setAttribute('activation', value)
})
