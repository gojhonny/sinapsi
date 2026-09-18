import {
  DEFAULT_SINAPSI_NODES,
  DEFAULT_SINAPSI_PALETTE,
  SINAPSI_COLOR_ATTRIBUTES,
  SINAPSI_COLOR_KEYS,
  SINAPSI_OBSERVED_ATTRIBUTES
} from '@core/config.data'
import { normalizeColor } from '@core/lib/normalize-color.compute'
import { normalizeMove } from '@core/lib/normalize-move.compute'
import {
  parseNodesDocument,
  reportInvalidNodes,
  serializeNodesDocument
} from '@core/lib/normalize-nodes.compute'
import { normalizePalette } from '@core/lib/normalize-palette.compute'
import { normalizeSpeed } from '@core/lib/normalize-speed.compute'
import type {
  SinapsiElement,
  SinapsiElementConstructor,
  SinapsiShadowTree
} from '@domain/kernel/element.types'
import {
  SINAPSI_NODE_CLICK_EVENT,
  SINAPSI_NODE_HOVER_EVENT,
  type SinapsiGraphDocument,
  type SinapsiNode,
  SinapsiNodeEvent,
  type SinapsiNodeEventName
} from '@domain/kernel/nodes.types'
import type {
  SinapsiColorKey,
  SinapsiMove,
  SinapsiPalette,
  SinapsiPaletteOverrides
} from '@domain/kernel/properties.types'
import { sinapsiShadowTreeFactory } from '@factories/shadow-tree.factory'
import { GraphAnimationService } from '@services/animation.service'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, SinapsiElementConstructor>()
const POINTER_CLICK_SLOP_PX = 6
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

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

    readonly #tree: SinapsiShadowTree
    readonly #animation: GraphAnimationService
    #acceptedNodes: SinapsiGraphDocument | null = null
    #connected = false
    #hostHovered = false
    #listFocused = false
    #hoverId: string | null = null
    #activeIndex = -1
    #pointerDownId: string | null = null
    #pointerDownX = 0
    #pointerDownY = 0
    #resizeObserver: ResizeObserver | undefined
    #motionQuery: MediaQueryList | undefined

    constructor() {
      super()
      const shadowRoot = this.attachShadow({ mode: 'closed' })
      this.#tree = sinapsiShadowTreeFactory(shadowRoot, this.ownerDocument)
      this.#animation = new GraphAnimationService(this.#tree.canvas, this.#properties())
      this.#tree.listbox.addEventListener('keydown', this.#onListKeyDown)
      this.#tree.listbox.addEventListener('focus', this.#onListFocus)
      this.#tree.listbox.addEventListener('blur', this.#onListBlur)
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

    get nodes(): SinapsiGraphDocument | null {
      return this.#acceptedNodes ? structuredClone(this.#acceptedNodes) : null
    }

    set nodes(value: SinapsiGraphDocument | string | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('nodes')
        return
      }

      const parsed = parseNodesDocument(value)
      if (!parsed.ok) {
        reportInvalidNodes(value)
        return
      }

      this.setAttribute('nodes', serializeNodesDocument(parsed.document))
    }

    connectedCallback(): void {
      if (this.#connected) {
        return
      }

      this.#connected = true
      this.#listen()
      this.#syncFreeze()
      this.#animation.start()
      this.#observeSize()
    }

    disconnectedCallback(): void {
      if (!this.#connected) {
        return
      }

      this.#connected = false
      this.#unlisten()
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

      if (name === 'nodes') {
        return this.#normalizeNodes(value)
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

      return false
    }

    #normalizeNodes(value: string | null): boolean {
      if (value === null) {
        this.#acceptedNodes = null
        this.#resetInteraction()
        this.#tree.syncOptions(null)
        return false
      }

      const parsed = parseNodesDocument(value)
      if (!parsed.ok) {
        reportInvalidNodes(value)
        if (this.#acceptedNodes) {
          return rewrite(this, 'nodes', value, serializeNodesDocument(this.#acceptedNodes))
        }

        this.removeAttribute('nodes')
        return true
      }

      this.#acceptedNodes = parsed.document
      this.#resetInteraction()
      this.#tree.syncOptions(parsed.document)
      return rewrite(this, 'nodes', value, serializeNodesDocument(parsed.document))
    }

    #properties() {
      return {
        palette: this.palette,
        move: this.move,
        speed: this.speed,
        generatedNodes: DEFAULT_SINAPSI_NODES,
        semanticNodes: this.#acceptedNodes
      }
    }

    #listen(): void {
      this.addEventListener('pointerenter', this.#onPointerEnter)
      this.addEventListener('pointerleave', this.#onPointerLeave)
      this.addEventListener('pointermove', this.#onPointerMove)
      this.addEventListener('pointerdown', this.#onPointerDown)
      this.addEventListener('pointerup', this.#onPointerUp)
      this.#motionQuery = globalThis.matchMedia?.(REDUCED_MOTION_QUERY)
      this.#motionQuery?.addEventListener('change', this.#onMotionPreference)
    }

    #unlisten(): void {
      this.removeEventListener('pointerenter', this.#onPointerEnter)
      this.removeEventListener('pointerleave', this.#onPointerLeave)
      this.removeEventListener('pointermove', this.#onPointerMove)
      this.removeEventListener('pointerdown', this.#onPointerDown)
      this.removeEventListener('pointerup', this.#onPointerUp)
      this.#motionQuery?.removeEventListener('change', this.#onMotionPreference)
      this.#motionQuery = undefined
    }

    #syncFreeze(): void {
      this.#animation.setFrozen(this.#hostHovered || this.#listFocused || prefersReducedMotion())
    }

    #resetInteraction(): void {
      this.#hoverId = null
      this.#activeIndex = -1
      this.#pointerDownId = null
      this.#animation.setHoverId(null)
      this.#animation.setFocusedId(null)
    }

    #setHover(id: string | null): void {
      if (id === this.#hoverId) {
        return
      }

      this.#hoverId = id
      this.#animation.setHoverId(id)
      const node = this.#nodeById(id)
      if (node) {
        this.#emit(SINAPSI_NODE_HOVER_EVENT, node, SinapsiNodeEvent.Hover)
      }
    }

    #activate(id: string): void {
      this.#animation.activateNeighborhood(id)
      const node = this.#nodeById(id)
      if (node) {
        this.#emit(SINAPSI_NODE_CLICK_EVENT, node, SinapsiNodeEvent.Click)
      }
    }

    #nodeById(id: string | null): SinapsiNode | undefined {
      if (!id || !this.#acceptedNodes) {
        return undefined
      }

      return this.#acceptedNodes.graph.find((node) => node.id === id)
    }

    #emit(
      type: typeof SINAPSI_NODE_CLICK_EVENT | typeof SINAPSI_NODE_HOVER_EVENT,
      node: SinapsiNode,
      event: SinapsiNodeEventName
    ): void {
      this.dispatchEvent(
        new CustomEvent(type, {
          detail: { id: node.id, event, payload: node.payload },
          bubbles: true,
          composed: true,
          cancelable: false
        })
      )
    }

    #focusOption(index: number): void {
      const nodes = this.#acceptedNodes?.graph ?? []
      const node = nodes[index]
      if (!node) {
        return
      }

      this.#activeIndex = index
      this.#tree.listbox.setAttribute('aria-activedescendant', `sinapsi-option-${index}`)
      this.#animation.setFocusedId(node.id)
      this.#setHover(node.id)
    }

    #onPointerEnter = (): void => {
      this.#hostHovered = true
      this.#syncFreeze()
    }

    #onPointerLeave = (): void => {
      this.#hostHovered = false
      this.#pointerDownId = null
      this.#setHover(null)
      this.#syncFreeze()
    }

    #onPointerMove = (event: PointerEvent): void => {
      if (!this.#acceptedNodes) {
        return
      }

      this.#setHover(this.#animation.pick(event))
    }

    #onPointerDown = (event: PointerEvent): void => {
      if (!this.#acceptedNodes) {
        return
      }

      this.#pointerDownId = this.#animation.pick(event)
      this.#pointerDownX = event.clientX
      this.#pointerDownY = event.clientY
    }

    #onPointerUp = (event: PointerEvent): void => {
      if (!this.#acceptedNodes || this.#pointerDownId === null) {
        return
      }

      const distance = Math.hypot(
        event.clientX - this.#pointerDownX,
        event.clientY - this.#pointerDownY
      )
      const id = this.#animation.pick(event)
      if (distance <= POINTER_CLICK_SLOP_PX && id && id === this.#pointerDownId) {
        this.#activate(id)
      }

      this.#pointerDownId = null
    }

    #onListKeyDown = (event: KeyboardEvent): void => {
      const count = this.#acceptedNodes?.graph.length ?? 0
      if (count === 0) {
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        this.#focusOption(stepIndex(this.#activeIndex, event.key === 'ArrowDown' ? 1 : -1, count))
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const node = this.#acceptedNodes?.graph[this.#activeIndex]
        if (node) {
          this.#activate(node.id)
        }
      }
    }

    #onListFocus = (): void => {
      this.#listFocused = true
      this.#syncFreeze()
      if (this.#activeIndex < 0) {
        this.#focusOption(0)
      } else {
        this.#animation.setFocusedId(this.#acceptedNodes?.graph[this.#activeIndex]?.id ?? null)
      }
    }

    #onListBlur = (): void => {
      this.#listFocused = false
      this.#animation.setFocusedId(null)
      this.#syncFreeze()
    }

    #onMotionPreference = (): void => {
      this.#syncFreeze()
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

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.(REDUCED_MOTION_QUERY)?.matches === true
}

function stepIndex(index: number, delta: number, count: number): number {
  if (index < 0) {
    return delta > 0 ? 0 : count - 1
  }

  return (index + delta + count) % count
}
