import { randomUnitVector } from "../math/vector3";
import { createPointCloud, type ShapeConfig } from "./pointCloud";
import { connectNearestNeighbors } from "./topology";
import type { Graph, GraphEdge, GraphNode } from "./types";

export interface GraphConfig {
  nodeCount: number;
  neighborsPerNode: number;
  hubCount: number;
  shape: ShapeConfig;
}

function degrees(edges: readonly GraphEdge[], nodeCount: number): number[] {
  const degree = new Array<number>(nodeCount).fill(0);
  for (const { source, target } of edges) {
    degree[source] += 1;
    degree[target] += 1;
  }
  return degree;
}

/** Hubs are the best-connected nodes, echoing the bright junctions in the reference art. */
function pickHubs(degree: readonly number[], hubCount: number): Set<number> {
  const ranked = degree.map((value, id) => ({ id, value })).sort((a, b) => b.value - a.value);
  return new Set(ranked.slice(0, hubCount).map(({ id }) => id));
}

export function createGraph(config: GraphConfig): Graph {
  const points = createPointCloud(config.nodeCount, config.shape);
  const edges = connectNearestNeighbors(points, config.neighborsPerNode);
  const hubs = pickHubs(degrees(edges, points.length), config.hubCount);

  const nodes: GraphNode[] = points.map((position, id) => ({
    id,
    position,
    jitterAxis: randomUnitVector(),
    jitterPhase: Math.random() * Math.PI * 2,
    isHub: hubs.has(id),
  }));

  return { nodes, edges };
}
