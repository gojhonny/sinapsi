import type { Vec3 } from "../math/vector3";

export interface GraphNode {
  readonly id: number;
  readonly position: Vec3;
  /** Direction and phase of this node's idle wobble. */
  readonly jitterAxis: Vec3;
  readonly jitterPhase: number;
  /** Well-connected junctions that get the primary color and a glow. */
  readonly isHub: boolean;
}

export interface GraphEdge {
  readonly source: number;
  readonly target: number;
}

export interface Graph {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}
