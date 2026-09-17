import type { GraphEdge } from "../graph/types";
import { lerp } from "../math/scalar";
import type { Viewport } from "../scene/projection";
import { palette } from "../theme";
import type { RenderFrame, RenderNode } from "./renderFrame";

const edgeDepth = (nodes: readonly RenderNode[], edge: GraphEdge): number =>
  (nodes[edge.source].depth + nodes[edge.target].depth) / 2;

/** Paints a projected frame on a 2D canvas, far elements first so near ones read on top. */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context is not available");
    this.ctx = ctx;
    this.resize();
  }

  get viewport(): Viewport {
    return { width: this.canvas.clientWidth, height: this.canvas.clientHeight };
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.viewport;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(frame: RenderFrame): void {
    this.paintBackdrop();
    this.paintEdges(frame);
    this.paintNodes(frame);
  }

  private paintBackdrop(): void {
    const { width, height } = this.viewport;
    const centerX = width / 2;
    const centerY = height / 2;
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.6);
    gradient.addColorStop(0, palette.surface);
    gradient.addColorStop(1, palette.background);

    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private paintEdges({ nodes, edges, reveal }: RenderFrame): void {
    const visible = edges.slice(0, Math.floor(edges.length * reveal));
    const farToNear = [...visible].sort((a, b) => edgeDepth(nodes, a) - edgeDepth(nodes, b));

    this.ctx.lineCap = "round";
    for (const edge of farToNear) {
      const from = nodes[edge.source];
      const to = nodes[edge.target];
      const depth = edgeDepth(nodes, edge);

      this.ctx.globalAlpha = lerp(0.08, 0.55, depth);
      this.ctx.strokeStyle = from.isHub || to.isHub ? palette.primary : palette.muted;
      this.ctx.lineWidth = lerp(0.5, 1.1, depth);
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();
    }
  }

  private paintNodes({ nodes, reveal, pulse }: RenderFrame): void {
    const farToNear = [...nodes].sort((a, b) => a.depth - b.depth);
    for (const node of farToNear) {
      if (node.isHub) {
        this.paintHub(node, reveal, pulse);
      } else {
        this.paintNode(node, reveal);
      }
    }
  }

  private paintNode(node: RenderNode, reveal: number): void {
    this.ctx.globalAlpha = lerp(0.3, 1, node.depth) * reveal;
    this.ctx.fillStyle = palette.text;
    this.ctx.shadowBlur = 0;
    this.disc(node, lerp(1.1, 2.4, node.depth) * reveal);
  }

  private paintHub(node: RenderNode, reveal: number, pulse: number): void {
    this.ctx.globalAlpha = lerp(0.6, 1, node.depth) * reveal;
    this.ctx.fillStyle = palette.primary;
    this.ctx.shadowColor = palette.primary;
    this.ctx.shadowBlur = lerp(8, 18, pulse);
    this.disc(node, lerp(2.4, 4.2, node.depth) * lerp(1, 1.35, pulse) * reveal);
    this.ctx.shadowBlur = 0;
  }

  private disc({ x, y }: RenderNode, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
