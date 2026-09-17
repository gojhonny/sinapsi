import { SINAPSI_TAG_NAME } from '@core/config.data'
import type { SinapsiElementConstructor } from '@domain/kernel/element.types'
import { sinapsiElementClassFactory } from '@factories/element-class.factory'

/** Defines `<sinap-si>` once in the active Custom Element registry. */
export function defineSinapsi(): SinapsiElementConstructor | undefined {
  if (typeof globalThis.customElements === 'undefined') {
    return undefined
  }

  const existing = globalThis.customElements.get(SINAPSI_TAG_NAME)
  if (existing) {
    return existing as SinapsiElementConstructor
  }

  const elementConstructor = sinapsiElementClassFactory()
  if (!elementConstructor) {
    return undefined
  }

  globalThis.customElements.define(SINAPSI_TAG_NAME, elementConstructor)

  return elementConstructor
}
