import { sinapsiConfiguration } from '@core/config.data'
import { activationOrder } from '@core/graph/activation-order.compute'
import { layoutForce } from '@core/graph/layout.compute'
import { degrees, preferentialAttachment } from '@core/graph/topology.compute'
import { randomUnitVector } from '@core/math/vector3.compute'
import type { Graph, GraphNode } from '@domain/kernel/graph.types'

export function createGraph(nodeCount: number): Graph {
  const { neighborsPerNode, shape } = sinapsiConfiguration.graph
  const edges = preferentialAttachment(nodeCount, neighborsPerNode)
  const positions = layoutForce(nodeCount, edges, shape.radius, shape.flatten)
  const degree = degrees(edges, nodeCount)
  const maxDegree = Math.max(1, ...degree)
  const ranks = activationOrder(edges, degree)
  const rankOf = new Map(ranks.map((id, rank) => [id, rank]))

  const nodes: GraphNode[] = positions.map((position, id) => ({
    id,
    position,
    jitterAxis: randomUnitVector(),
    jitterPhase: Math.random() * Math.PI * 2,
    weight: degree[id] / maxDegree,
    rank: rankOf.get(id) ?? id
  }))

  return { nodes, edges }
}
