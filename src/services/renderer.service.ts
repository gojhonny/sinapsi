import { lerp } from '@core/math/scalar.compute'
import type { SinapsiPalette } from '@domain/kernel/properties.types'
import type { RenderFrame, RenderNode, Viewport } from '@domain/kernel/render.types'
import { blendHex } from '@services/scene.service'

const BASE_VIEW = 256

/** Paints an Obsidian-colored 3D plexus: muted leaves, bright hubs, accent when activated. */
export class CanvasRendererService {
  private readonly ctx: CanvasRenderingContext2D

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('2D canvas context is not available')
    }
    this.ctx = ctx
    this.resize()
  }

  get viewport(): Viewport {
    return { width: this.canvas.clientWidth, height: this.canvas.clientHeight }
  }

  resize(): void {
    const dpr = globalThis.devicePixelRatio || 1
    const { width, height } = this.viewport
    this.canvas.width = Math.max(1, Math.round(width * dpr))
    this.canvas.height = Math.max(1, Math.round(height * dpr))
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  render(frame: RenderFrame, palette: SinapsiPalette): void {
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height)
    this.paintEdges(frame, palette)
    this.paintNodes(frame, palette)
  }

  private paintEdges({ nodes, edges, reveal }: RenderFrame, palette: SinapsiPalette): void {
    const visible = edges.slice(0, Math.floor(edges.length * Math.max(reveal, 0.2)))
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = palette.muted

    for (const edge of visible) {
      const from = nodes[edge.source]
      const to = nodes[edge.target]
      const near = 1 - (from.depth + to.depth) / 2
      this.ctx.globalAlpha = (0.14 + 0.28 * near) * Math.max(reveal, 0.45)
      this.ctx.beginPath()
      this.ctx.moveTo(from.x, from.y)
      this.ctx.lineTo(to.x, to.y)
      this.ctx.stroke()
    }
  }

  private paintNodes({ nodes, reveal }: RenderFrame, palette: SinapsiPalette): void {
    const scale = this.nodeScale()
    const farToNear = [...nodes].sort((a, b) => a.depth - b.depth)
    for (const node of farToNear) {
      const depthFade = lerp(1, 0.42, node.depth)
      const radius = lerp(1.5, 5.0, node.weight ** 1.7) * scale * depthFade
      const resting = blendHex(palette.muted, palette.text, node.weight ** 0.55)
      this.ctx.globalAlpha = Math.max(reveal, 0.55) * lerp(1, 0.55, node.depth)
      this.ctx.fillStyle = blendHex(resting, palette.primary, node.lit)
      this.ctx.shadowColor = palette.primary
      this.ctx.shadowBlur = node.lit * 4 * scale
      this.disc(node, radius)
      this.ctx.shadowBlur = 0
    }
  }

  private nodeScale(): number {
    return Math.min(this.viewport.width, this.viewport.height) / BASE_VIEW
  }

  private disc({ x, y }: RenderNode, radius: number): void {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}
