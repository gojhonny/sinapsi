import { sinapsiConfiguration } from '@core/config.data'
import { layoutForce } from '@core/graph/layout.compute'
import { length, randomUnitVector, scale, vec3 } from '@core/math/vector3.compute'
import type { Graph, GraphEdge, GraphNode, Vec3 } from '@domain/kernel/graph.types'
import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'

/** Builds a plexus from a validated semantic document; edges come only from `link.id`. */
export function createSemanticGraph(document: SinapsiGraphDocument): Graph {
  const count = document.graph.length
  if (count === 0) {
    return { nodes: [], edges: [] }
  }

  const indexById = new Map(document.graph.map((node, index) => [node.id, index]))
  const edges = linksToEdges(document, indexById)
  const { radius, roughness } = sinapsiConfiguration.graph.shape
  const positions = fitSemanticPositions(layoutForce(count, edges, radius, roughness), radius)
  const degree = nodeDegrees(edges, count)
  const maxDegree = Math.max(1, ...degree)

  const nodes: GraphNode[] = document.graph.map((node, index) => ({
    id: index,
    key: node.id,
    name: node.name,
    position: positions[index],
    jitterAxis: randomUnitVector(),
    jitterPhase: Math.random() * Math.PI * 2,
    weight: degree[index] / maxDegree,
    rank: index
  }))

  return { nodes, edges }
}

/** Fit the static 3D layout once, so dense semantic networks use their host space. */
function fitSemanticPositions(positions: readonly Vec3[], radius: number): Vec3[] {
  const center = vec3(
    (Math.min(...positions.map((point) => point.x)) +
      Math.max(...positions.map((point) => point.x))) /
      2,
    (Math.min(...positions.map((point) => point.y)) +
      Math.max(...positions.map((point) => point.y))) /
      2,
    (Math.min(...positions.map((point) => point.z)) +
      Math.max(...positions.map((point) => point.z))) /
      2
  )
  const centered = positions.map((point) =>
    vec3(point.x - center.x, point.y - center.y, point.z - center.z)
  )
  const farthest = Math.max(...centered.map(length))
  if (farthest <= 1e-8) return centered
  return centered.map((point) => scale(point, radius / farthest))
}

function linksToEdges(
  document: SinapsiGraphDocument,
  indexById: ReadonlyMap<string, number>
): GraphEdge[] {
  const edges: GraphEdge[] = []
  const seen = new Set<string>()

  for (const node of document.graph) {
    const source = indexById.get(node.id)
    if (source === undefined) {
      continue
    }

    for (const link of node.links) {
      const target = indexById.get(link.id)
      if (target === undefined || source === target) {
        continue
      }

      const [low, high] = source < target ? [source, target] : [target, source]
      const key = `${low}:${high}`
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      edges.push({ source: low, target: high })
    }
  }

  return edges
}

function nodeDegrees(edges: readonly GraphEdge[], count: number): number[] {
  const degree = Array.from({ length: count }, () => 0)
  for (const edge of edges) {
    degree[edge.source] += 1
    degree[edge.target] += 1
  }
  return degree
}
