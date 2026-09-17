import {
  DEFAULT_SINAPSI_PALETTE,
  SINAPSI_COLOR_ATTRIBUTES,
  SINAPSI_COLOR_KEYS,
  SINAPSI_OBSERVED_ATTRIBUTES
} from '@core/config.data'
import { normalizeActivation } from '@core/lib/normalize-activation.compute'
import { normalizeColor } from '@core/lib/normalize-color.compute'
import { normalizeMove } from '@core/lib/normalize-move.compute'
import { normalizeNodes } from '@core/lib/normalize-nodes.compute'
import { normalizePalette } from '@core/lib/normalize-palette.compute'
import { normalizeSpeed } from '@core/lib/normalize-speed.compute'
import type { SinapsiElement, SinapsiElementConstructor } from '@domain/kernel/element.types'
import type { SinapsiColorKey, SinapsiMove, SinapsiPalette, SinapsiPaletteOverrides } from '@domain/kernel/properties.types'
import { sinapsiShadowTreeFactory } from '@factories/shadow-tree.factory'
import { GraphAnimationService } from '@services/animation.service'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, SinapsiElementConstructor>()

/**
 * Creates the Sinapsi custom-element class only when a DOM implementation exists.
 * Importing this module on a server never evaluates an HTMLElement subclass.
 */
export function sinapsiElementClassFactory(): SinapsiElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined') {
    return undefined
  }

  const HTMLElementBase = globalThis.HTMLElement
  const existingConstructor = ELEMENT_CONSTRUCTORS.get(HTMLElementBase)
  if (existingConstructor) {
    return existingConstructor
  }

  class SinapsiHTMLElement extends HTMLElementBase implements SinapsiElement {
    static readonly observedAttributes = SINAPSI_OBSERVED_ATTRIBUTES

    readonly #animation: GraphAnimationService
    #connected = false
    #resizeObserver: ResizeObserver | undefined

    constructor() {
      super()
      const shadowRoot = this.attachShadow({ mode: 'closed' })
      const { canvas } = sinapsiShadowTreeFactory(shadowRoot, this.ownerDocument)
      this.#animation = new GraphAnimationService(canvas, this.#properties())
    }

    get palette(): SinapsiPalette {
      const palette = { ...DEFAULT_SINAPSI_PALETTE }
      for (const key of SINAPSI_COLOR_KEYS) {
        palette[key] = normalizeColor(key, this.getAttribute(SINAPSI_COLOR_ATTRIBUTES[key]))
      }
      return palette
    }

    set palette(value: SinapsiPaletteOverrides | null | undefined) {
      const palette = normalizePalette(value)
      for (const key of SINAPSI_COLOR_KEYS) {
        this.setAttribute(SINAPSI_COLOR_ATTRIBUTES[key], palette[key])
      }
    }

    get move(): SinapsiMove {
      return normalizeMove(this.getAttribute('move'))
    }

    set move(value: SinapsiMove | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('move')
        return
      }

      this.setAttribute('move', normalizeMove(value))
    }

    get speed(): number {
      return normalizeSpeed(this.getAttribute('speed'))
    }

    set speed(value: number | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('speed')
        return
      }

      this.setAttribute('speed', String(normalizeSpeed(value)))
    }

    get nodes(): number {
      return normalizeNodes(this.getAttribute('nodes'))
    }

    set nodes(value: number | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('nodes')
        return
      }

      this.setAttribute('nodes', String(normalizeNodes(value)))
    }

    get activation(): number {
      return normalizeActivation(this.getAttribute('activation'))
    }

    set activation(value: number | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('activation')
        return
      }

      this.setAttribute('activation', String(normalizeActivation(value)))
    }

    connectedCallback(): void {
      if (this.#connected) {
        return
      }

      this.#connected = true
      this.#animation.start()
      this.#observeSize()
    }

    disconnectedCallback(): void {
      if (!this.#connected) {
        return
      }

      this.#connected = false
      this.#resizeObserver?.disconnect()
      this.#resizeObserver = undefined
      this.#animation.dispose()
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      if (oldValue === newValue) {
        return
      }

      if (this.#normalizeAttribute(name, newValue)) {
        return
      }

      this.#animation.apply(this.#properties())
    }

    #normalizeAttribute(name: string, value: string | null): boolean {
      const colorKey = colorKeyForAttribute(name)
      if (colorKey) {
        if (value === null) {
          return false
        }
        const normalized = normalizeColor(colorKey, value)
        if (value !== normalized) {
          this.setAttribute(name, normalized)
          return true
        }
        return false
      }

      if (value === null) {
        return false
      }

      if (name === 'move') {
        return rewrite(this, name, value, normalizeMove(value))
      }

      if (name === 'speed') {
        return rewrite(this, name, value, String(normalizeSpeed(value)))
      }

      if (name === 'nodes') {
        return rewrite(this, name, value, String(normalizeNodes(value)))
      }

      if (name === 'activation') {
        return rewrite(this, name, value, String(normalizeActivation(value)))
      }

      return false
    }

    #properties() {
      return {
        palette: this.palette,
        move: this.move,
        speed: this.speed,
        nodes: this.nodes,
        activation: this.activation
      }
    }

    #observeSize(): void {
      if (typeof globalThis.ResizeObserver !== 'function') {
        return
      }

      this.#resizeObserver = new ResizeObserver(() => this.#animation.resize())
      this.#resizeObserver.observe(this)
    }
  }

  const elementConstructor = SinapsiHTMLElement as unknown as SinapsiElementConstructor
  ELEMENT_CONSTRUCTORS.set(HTMLElementBase, elementConstructor)
  return elementConstructor
}

function rewrite(element: HTMLElement, name: string, value: string, normalized: string): boolean {
  if (value === normalized) {
    return false
  }

  element.setAttribute(name, normalized)
  return true
}

function colorKeyForAttribute(name: string): SinapsiColorKey | undefined {
  return SINAPSI_COLOR_KEYS.find((key) => SINAPSI_COLOR_ATTRIBUTES[key] === name)
}
