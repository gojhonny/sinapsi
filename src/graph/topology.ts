import { distance, type Vec3 } from "../math/vector3";
import type { GraphEdge } from "./types";

const normalizeEdge = (a: number, b: number): GraphEdge =>
  a < b ? { source: a, target: b } : { source: b, target: a };

const edgeKey = (edge: GraphEdge): string => `${edge.source}:${edge.target}`;

function nearestNeighbors(points: readonly Vec3[], index: number, count: number): number[] {
  const origin = points[index];
  return points
    .map((point, other) => ({ other, dist: distance(origin, point) }))
    .filter(({ other }) => other !== index)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(({ other }) => other);
}

/** Links every point to its k nearest neighbors, deduplicating shared edges. */
export function connectNearestNeighbors(points: readonly Vec3[], neighborsPerNode: number): GraphEdge[] {
  const edges = new Map<string, GraphEdge>();
  points.forEach((_, index) => {
    for (const neighbor of nearestNeighbors(points, index, neighborsPerNode)) {
      const edge = normalizeEdge(index, neighbor);
      edges.set(edgeKey(edge), edge);
    }
  });
  return [...edges.values()];
}
