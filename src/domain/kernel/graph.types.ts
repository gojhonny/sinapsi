export interface Vec3 {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface GraphNode {
  readonly id: number
  /** Stable consumer id in semantic mode; stringified index when generated. */
  readonly key: string
  readonly name: string
  readonly position: Vec3
  /** Direction of this node's idle wobble. */
  readonly jitterAxis: Vec3
  readonly jitterPhase: number
  /** Connectivity relative to the best-connected node, from 0 to 1; drives the node radius. */
  readonly weight: number
  /** Internal BFS rank on generated graphs; not a public lighting control. */
  readonly rank: number
}

export interface GraphEdge {
  readonly source: number
  readonly target: number
}

export interface Graph {
  readonly nodes: readonly GraphNode[]
  readonly edges: readonly GraphEdge[]
}
