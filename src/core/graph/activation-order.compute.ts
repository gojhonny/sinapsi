import { adjacency } from './topology.compute'

/**
 * Breadth-first ranks from the most connected node so activation spreads through
 * the network. Remaining disconnected components are appended by remaining degree.
 */
export function activationOrder(edges: readonly { source: number; target: number }[], degree: readonly number[]): number[] {
  const neighbors = adjacency(edges, degree.length)
  const remaining = degree.map((value, id) => ({ id, value }))
  const visited = new Set<number>()
  const order: number[] = []

  while (visited.size < degree.length) {
    remaining.sort((a, b) => b.value - a.value)
    const start = remaining.find(({ id }) => !visited.has(id))
    if (!start) {
      break
    }

    const queue = [start.id]
    visited.add(start.id)

    while (queue.length > 0) {
      const current = queue.shift()
      if (current === undefined) {
        break
      }

      order.push(current)
      const next = [...neighbors[current]].sort((a, b) => degree[b] - degree[a] || a - b)
      for (const neighbor of next) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }
  }

  return order
}
