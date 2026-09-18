export interface PickableNode {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly depth: number
  readonly radius: number
}

/** Closest painted hit: highest depth inside radius, then stable string id. */
export function pickNode(nodes: readonly PickableNode[], x: number, y: number): string | null {
  const hits = nodes.filter((node) => Math.hypot(node.x - x, node.y - y) <= node.radius)
  if (hits.length === 0) {
    return null
  }

  return [...hits].sort(
    (left, right) => right.depth - left.depth || left.id.localeCompare(right.id)
  )[0].id
}
