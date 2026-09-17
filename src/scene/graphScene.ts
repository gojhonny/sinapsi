import type { Graph, GraphNode } from "../graph/types";
import { add, length, rotateX, rotateY, scale, type Vec3 } from "../math/vector3";
import type { RenderFrame, RenderNode } from "../render/renderFrame";
import { project, type Camera, type Viewport } from "./projection";

export interface SceneConfig {
  /** Radians per second around each axis. */
  rotationSpeed: { x: number; y: number };
  /** Idle wobble applied to every node along its own axis. */
  jitter: { amplitude: number; frequency: number };
  camera: Camera;
}

/** Owns the time-dependent state of the graph and projects it for rendering. */
export class GraphScene {
  reveal = 0;
  pulse = 0;

  private readonly sceneRadius: number;
  private readonly rotation = { x: 0, y: 0 };
  private elapsed = 0;

  constructor(
    private readonly graph: Graph,
    private readonly config: SceneConfig,
  ) {
    this.sceneRadius = Math.max(...graph.nodes.map((node) => length(node.position)));
  }

  advance(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    this.rotation.x += this.config.rotationSpeed.x * deltaSeconds;
    this.rotation.y += this.config.rotationSpeed.y * deltaSeconds;
  }

  snapshot(viewport: Viewport): RenderFrame {
    return {
      nodes: this.graph.nodes.map((node) => this.projectNode(node, viewport)),
      edges: this.graph.edges,
      reveal: this.reveal,
      pulse: this.pulse,
    };
  }

  private projectNode(node: GraphNode, viewport: Viewport): RenderNode {
    const world = rotateX(rotateY(this.jittered(node), this.rotation.y), this.rotation.x);
    return { ...project(world, this.config.camera, viewport, this.sceneRadius), isHub: node.isHub };
  }

  /** Small per-node oscillation so the mesh breathes instead of turning as a rigid body. */
  private jittered(node: GraphNode): Vec3 {
    const { amplitude, frequency } = this.config.jitter;
    const offset = Math.sin(this.elapsed * frequency + node.jitterPhase) * amplitude;
    return add(node.position, scale(node.jitterAxis, offset));
  }
}
