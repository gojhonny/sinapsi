import {
  containsPoint,
  intersectBounds,
  type PresentationBounds,
  type PresentationSide,
  positionPresentation
} from '@core/scene/presentation-position.compute'
import type { SinapsiShadowTree } from '@domain/kernel/element.types'
import type { SinapsiNode } from '@domain/kernel/nodes.types'
import type { SinapsiPalette } from '@domain/kernel/properties.types'
import type { RenderFrame } from '@domain/kernel/render.types'

interface PresentationGeometry {
  readonly canvas: DOMRect
  readonly host: DOMRect
  readonly visible: PresentationBounds
  readonly boundary: PresentationBounds
  readonly width: number
  readonly height: number
  readonly scaleX: number
  readonly scaleY: number
}

/** A single nonmodal HTML detail group, anchored by the renderer's own frame. */
export class GraphPresentationService {
  private node: SinapsiNode | null = null
  private frame: RenderFrame | null = null
  private geometry: PresentationGeometry | null = null
  private side: PresentationSide | undefined
  private dirty = true
  private visible = false
  private connected = false
  private readonly topLayer: boolean
  private observer: ResizeObserver | undefined
  private avatar: HTMLImageElement | null = null
  private avatarSource: string | null = null
  private lastTransform = ''

  constructor(
    private readonly host: HTMLElement,
    private readonly tree: SinapsiShadowTree
  ) {
    this.topLayer =
      typeof tree.presentation.showPopover === 'function' &&
      typeof tree.presentation.hidePopover === 'function'
    tree.presentation.dataset.layer = this.topLayer ? 'top' : 'local'
    if (this.topLayer) tree.presentation.setAttribute('popover', 'manual')
  }

  get openId(): string | null {
    return this.node?.id ?? null
  }

  connect(): void {
    if (this.connected) return
    this.connected = true
    const document = this.host.ownerDocument
    document.addEventListener('scroll', this.invalidate, true)
    document.defaultView?.addEventListener('resize', this.invalidate)
    document.defaultView?.visualViewport?.addEventListener('resize', this.invalidate)
    document.defaultView?.visualViewport?.addEventListener('scroll', this.invalidate)
    document.fonts?.addEventListener('loadingdone', this.invalidate)
    if (typeof ResizeObserver === 'function') {
      this.observer = new ResizeObserver(this.invalidate)
      this.observer.observe(this.host)
      this.observer.observe(this.tree.presentation)
    }
  }

  disconnect(): void {
    this.close(false)
    this.connected = false
    const document = this.host.ownerDocument
    document.removeEventListener('scroll', this.invalidate, true)
    document.defaultView?.removeEventListener('resize', this.invalidate)
    document.defaultView?.visualViewport?.removeEventListener('resize', this.invalidate)
    document.defaultView?.visualViewport?.removeEventListener('scroll', this.invalidate)
    document.fonts?.removeEventListener('loadingdone', this.invalidate)
    this.observer?.disconnect()
    this.observer = undefined
    this.frame = null
    this.geometry = null
    this.tree.content.replaceChildren()
  }

  configure(palette: SinapsiPalette, closeLabel: string): void {
    const panel = this.tree.presentation
    panel.style.setProperty('--sinapsi-primary', palette.primary)
    panel.style.setProperty('--sinapsi-text', palette.text)
    panel.style.setProperty('--sinapsi-muted', palette.muted)
    this.tree.close.setAttribute('aria-label', closeLabel.trim() || 'Close')
    this.invalidate()
  }

  show(node: SinapsiNode, announce = true): void {
    if (!node.presentation) return
    if (node.id !== this.node?.id) this.side = undefined
    this.node = node
    this.renderContent(node)
    if (announce) this.tree.live.textContent = summary(node)
    this.invalidate()
  }

  close(restoreFocus: boolean): void {
    if (restoreFocus && this.node) this.tree.listbox.focus({ preventScroll: true })
    this.setVisible(false, false)
    this.node = null
    this.side = undefined
    this.clearAvatarHandlers()
    this.avatar = null
    this.avatarSource = null
    this.tree.live.textContent = ''
  }

  update(frame: RenderFrame): void {
    this.frame = frame
    this.position()
  }

  invalidate = (): void => {
    this.dirty = true
    this.position()
  }

  private renderContent(node: SinapsiNode): void {
    const presentation = node.presentation
    if (!presentation) return
    const { content, presentation: panel } = this.tree
    const document = this.host.ownerDocument
    this.clearAvatarHandlers()
    content.replaceChildren()
    this.avatar = null
    this.avatarSource = null
    panel.dataset.type = presentation.type
    panel.removeAttribute('aria-labelledby')
    panel.setAttribute('aria-label', node.name)

    if (presentation.type === 'card' && presentation.avatarUrl) {
      const source = safeAvatarUrl(presentation.avatarUrl, document.baseURI)
      if (source) {
        const avatar = document.createElement('img')
        avatar.className = 'presentation-avatar'
        avatar.setAttribute('part', 'avatar')
        avatar.alt = presentation.avatarAlt ?? ''
        avatar.width = 48
        avatar.height = 48
        avatar.decoding = 'async'
        avatar.onload = this.invalidate
        avatar.onerror = () => {
          if (this.avatar !== avatar) return
          avatar.onload = null
          avatar.onerror = null
          avatar.remove()
          this.avatar = null
          this.avatarSource = null
          this.invalidate()
        }
        this.avatar = avatar
        this.avatarSource = source
        content.append(avatar)
      }
    }

    const copy = document.createElement('div')
    copy.className = 'presentation-copy'
    const fields =
      presentation.type === 'tooltip'
        ? ([['description', presentation.description]] as const)
        : ([
            ['title', presentation.title],
            ['description', presentation.description],
            ['reference', presentation.reference],
            ['badge', presentation.badge]
          ] as const)
    for (const [field, value] of fields) {
      if (!value?.trim()) continue
      const text = document.createElement(field === 'title' ? 'strong' : 'span')
      text.className = `presentation-${field}`
      text.setAttribute('part', field)
      text.textContent = value
      if (field === 'title') {
        text.id = `${panel.id}-title`
        panel.setAttribute('aria-labelledby', text.id)
        panel.removeAttribute('aria-label')
      }
      copy.append(text)
    }
    content.append(copy)
  }

  private clearAvatarHandlers(): void {
    if (this.avatar) {
      this.avatar.onload = null
      this.avatar.onerror = null
    }
  }

  private position(): void {
    if (!this.node || !this.frame || !this.connected) return
    const node = this.frame.nodes.find((entry) => entry.id === this.node?.id)
    if (!node) {
      this.setVisible(false)
      return
    }
    if (this.dirty || !this.geometry) this.measure()
    const geometry = this.geometry
    if (!geometry) return
    const x = geometry.canvas.left + node.x * geometry.scaleX
    const y = geometry.canvas.top + node.y * geometry.scaleY
    if (!containsPoint(geometry.visible, x, y)) {
      this.setVisible(false)
      return
    }
    this.setVisible(true)
    const placement = positionPresentation(
      { x, y },
      { width: geometry.width, height: geometry.height },
      geometry.boundary,
      this.side
    )
    this.side = placement.side
    const left = this.topLayer ? placement.x : (placement.x - geometry.host.left) / geometry.scaleX
    const top = this.topLayer ? placement.y : (placement.y - geometry.host.top) / geometry.scaleY
    const transform = `translate(${left.toFixed(2)}px, ${top.toFixed(2)}px)`
    if (transform !== this.lastTransform) {
      this.tree.presentation.style.transform = transform
      this.lastTransform = transform
    }
    this.tree.presentation.dataset.side = placement.side
  }

  private measure(): void {
    this.dirty = false
    const document = this.host.ownerDocument
    const view = document.defaultView
    const canvas = this.tree.canvas.getBoundingClientRect()
    const host = this.host.getBoundingClientRect()
    const viewport = view?.visualViewport
    const left = viewport?.offsetLeft ?? 0
    const top = viewport?.offsetTop ?? 0
    const windowBounds = {
      left,
      top,
      right: left + (viewport?.width ?? view?.innerWidth ?? 0),
      bottom: top + (viewport?.height ?? view?.innerHeight ?? 0)
    }
    let visible = intersectBounds(canvas, windowBounds)
    for (let ancestor = this.host.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = view?.getComputedStyle(ancestor)
      if (style && /(auto|scroll|hidden|clip)/u.test(`${style.overflowX} ${style.overflowY}`)) {
        visible = intersectBounds(visible, ancestor.getBoundingClientRect())
      }
    }
    const area = this.topLayer ? windowBounds : visible
    const boundary = {
      left: area.left + 8,
      top: area.top + 8,
      right: area.right - 8,
      bottom: area.bottom - 8
    }
    const panel = this.tree.presentation
    const width = Math.max(0, boundary.right - boundary.left)
    const height = Math.max(0, boundary.bottom - boundary.top)
    const scaleX = canvas.width / (this.tree.canvas.clientWidth || canvas.width || 1)
    const scaleY = canvas.height / (this.tree.canvas.clientHeight || canvas.height || 1)
    panel.style.maxWidth = `${this.topLayer ? width : width / (scaleX || 1)}px`
    panel.style.maxHeight = `${this.topLayer ? height : height / (scaleY || 1)}px`
    // A hidden popover has no measurable layout. Briefly make it measurable but
    // invisible; this occurs only on invalidation, never in the steady frame path.
    const wasVisible = this.visible
    if (!wasVisible) {
      panel.style.visibility = 'hidden'
      panel.hidden = false
      if (this.topLayer && this.host.isConnected) this.tryShow()
    }
    const bounds = panel.getBoundingClientRect()
    this.geometry = {
      canvas,
      host,
      visible,
      boundary,
      width: Math.min(bounds.width, width),
      height: Math.min(bounds.height, height),
      scaleX,
      scaleY
    }
    if (!wasVisible) {
      if (this.topLayer) this.tryHide()
      panel.hidden = true
      panel.style.visibility = ''
    }
  }

  private setVisible(visible: boolean, returnHiddenFocus = true): void {
    if (visible && this.avatar && this.avatarSource && !this.avatar.hasAttribute('src')) {
      this.avatar.src = this.avatarSource
    }
    if (visible === this.visible) return
    const panel = this.tree.presentation
    if (!visible && returnHiddenFocus && panel.contains(this.tree.root.activeElement)) {
      this.tree.listbox.focus({ preventScroll: true })
    }
    this.visible = visible
    if (visible) {
      panel.hidden = false
      if (this.topLayer) this.tryShow()
    } else {
      if (this.topLayer) this.tryHide()
      panel.hidden = true
    }
  }

  private tryShow(): void {
    try {
      // Popover source establishes the next Tab stop across the top layer;
      // its details remain a nonmodal group, with focus on the listbox.
      const show = this.tree.presentation.showPopover as (options: { source: HTMLElement }) => void
      show.call(this.tree.presentation, { source: this.tree.listbox })
    } catch {
      /* A disconnected host cannot enter the top layer. */
    }
  }

  private tryHide(): void {
    try {
      this.tree.presentation.hidePopover()
    } catch {
      /* Already hidden or disconnected. */
    }
  }
}

function safeAvatarUrl(value: string, base: string): string | null {
  try {
    const url = new URL(value, base)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

function summary(node: SinapsiNode): string {
  const presentation = node.presentation
  if (!presentation) return node.name
  return presentation.type === 'tooltip'
    ? `${node.name}. ${presentation.description}`
    : [
        presentation.title ?? node.name,
        presentation.description,
        presentation.reference,
        presentation.badge
      ]
        .filter(Boolean)
        .join('. ')
}
