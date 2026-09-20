import type { RenderNode, Viewport } from '@domain/kernel/render.types'

/** Final semantic framing, shared by painting, hit testing and presentation anchors. */
export function fitProjection(
  nodes: readonly RenderNode[],
  viewport: Viewport,
  envelope = 1
): readonly RenderNode[] {
  if (nodes.length === 0) return nodes
  const centerX = viewport.width / 2
  const centerY = viewport.height / 2
  const minX = Math.min(...nodes.map((node) => node.x))
  const maxX = Math.max(...nodes.map((node) => node.x))
  const minY = Math.min(...nodes.map((node) => node.y))
  const maxY = Math.max(...nodes.map((node) => node.y))
  const spanX = maxX - minX
  const spanY = maxY - minY
  const originX = (minX + maxX) / 2
  const originY = (minY + maxY) / 2
  if (nodes.length === 1 || (spanX <= 1e-6 && spanY <= 1e-6)) {
    return nodes.map((node) => ({ ...node, x: centerX, y: centerY }))
  }
  const shortest = Math.max(0, Math.min(viewport.width, viewport.height))
  // Resting discs are at most 5px at a 256px host; allow their focus outlines too.
  const padding = Math.min(shortest / 3, Math.max(24, (shortest / 256) * 5 + 8))
  const width = Math.max(0, viewport.width - padding * 2)
  const height = Math.max(0, viewport.height - padding * 2)
  const scale =
    Math.max(0, Math.min(1, envelope)) *
    Math.min(spanX > 1e-6 ? width / spanX : Infinity, spanY > 1e-6 ? height / spanY : Infinity)
  return nodes.map((node) => ({
    ...node,
    x: centerX + (node.x - originX) * scale,
    y: centerY + (node.y - originY) * scale
  }))
}
