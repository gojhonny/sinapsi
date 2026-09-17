import type { GraphEdge } from '@domain/kernel/graph.types'

const normalizeEdge = (a: number, b: number): GraphEdge =>
  a < b ? { source: a, target: b } : { source: b, target: a }

const edgeKey = (edge: GraphEdge): string => `${edge.source}:${edge.target}`

/**
 * Scale-free links in the Obsidian sense: new nodes attach to already-busy hubs,
 * so a few notes become large and most stay small.
 */
export function preferentialAttachment(nodeCount: number, linksPerNode: number): GraphEdge[] {
  const m = Math.max(1, Math.min(linksPerNode, Math.max(1, nodeCount - 1)))
  const edges = new Map<string, GraphEdge>()
  const degree = new Array<number>(nodeCount).fill(0)

  const add = (a: number, b: number): void => {
    if (a === b) {
      return
    }
    const edge = normalizeEdge(a, b)
    const key = edgeKey(edge)
    if (edges.has(key)) {
      return
    }
    edges.set(key, edge)
    degree[a] += 1
    degree[b] += 1
  }

  const seed = Math.min(nodeCount, m + 1)
  for (let i = 0; i < seed; i++) {
    for (let j = i + 1; j < seed; j++) {
      add(i, j)
    }
  }

  for (let node = seed; node < nodeCount; node++) {
    const picks = new Set<number>()
    const total = degree.slice(0, node).reduce((sum, value) => sum + Math.max(value, 1), 0)
    let attempts = 0
    while (picks.size < Math.min(m, node) && attempts < node * 12) {
      attempts += 1
      let ticket = Math.random() * total
      for (let candidate = 0; candidate < node; candidate++) {
        ticket -= Math.max(degree[candidate], 1)
        if (ticket <= 0) {
          picks.add(candidate)
          break
        }
      }
    }
    for (const hub of picks) {
      add(node, hub)
    }
  }

  return [...edges.values()]
}

export function degrees(edges: readonly GraphEdge[], nodeCount: number): number[] {
  const degree = new Array<number>(nodeCount).fill(0)
  for (const { source, target } of edges) {
    degree[source] += 1
    degree[target] += 1
  }
  return degree
}

export function adjacency(edges: readonly GraphEdge[], nodeCount: number): number[][] {
  const neighbors: number[][] = Array.from({ length: nodeCount }, () => [])
  for (const { source, target } of edges) {
    neighbors[source].push(target)
    neighbors[target].push(source)
  }
  return neighbors
}
