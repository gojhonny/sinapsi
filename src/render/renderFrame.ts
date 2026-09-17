import type { GraphEdge } from "../graph/types";
import type { ProjectedPoint } from "../scene/projection";

export interface RenderNode extends ProjectedPoint {
  readonly isHub: boolean;
}

/** Everything the renderer needs for one frame, already projected to screen space. */
export interface RenderFrame {
  readonly nodes: readonly RenderNode[];
  readonly edges: readonly GraphEdge[];
  /** 0..1 intro progress: edges grow in and nodes fade in. */
  readonly reveal: number;
  /** 0..1 hub glow pulse. */
  readonly pulse: number;
}
