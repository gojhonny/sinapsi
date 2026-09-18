import { sinapsiConfiguration } from '@core/config.data'
import { clamp01, lerp } from '@core/math/scalar.compute'
import {
  add,
  cross,
  length,
  normalize,
  randomUnitVector,
  rotateAroundAxis,
  scale,
  vec3
} from '@core/math/vector3.compute'
import { heartbeat } from '@core/scene/heartbeat.compute'
import { project } from '@core/scene/projection.compute'
import type { Graph, GraphNode, Vec3 } from '@domain/kernel/graph.types'
import type { SinapsiMove } from '@domain/kernel/properties.types'
import type { RenderFrame, RenderNode, Viewport } from '@domain/kernel/render.types'

const TWO_PI = Math.PI * 2

/** Owns the time-dependent state of the graph and projects it for rendering. */
export class GraphSceneService {
  reveal = 0
  activation = 0

  private sceneRadius: number
  private readonly spinAxis: Vec3
  private readonly precessAxis: Vec3
  private spin = 0
  private precession = 0
  private elapsed = 0
  private pulsePhase = 0

  constructor(private graph: Graph) {
    this.sceneRadius = Math.max(...graph.nodes.map((node) => length(node.position)), 1)
    this.spinAxis = randomUnitVector()
    this.precessAxis = perpendicularAxis(this.spinAxis)
  }

  replaceGraph(graph: Graph): void {
    this.graph = graph
    this.sceneRadius = Math.max(...graph.nodes.map((node) => length(node.position)), 1)
  }

  advance(deltaSeconds: number, move: SinapsiMove, speed: number): void {
    this.elapsed += deltaSeconds
    const { secondsPerTurn, tilt } = sinapsiConfiguration.motion
    const turnSpeed = (TWO_PI / secondsPerTurn) * speed

    if (move === 'rotate') {
      this.spin += turnSpeed * deltaSeconds
      this.precession += turnSpeed * (0.28 + Math.abs(tilt)) * deltaSeconds
    }

    if (move === 'pulse') {
      this.pulsePhase += (sinapsiConfiguration.motion.beatsPerMinute / 60) * speed * deltaSeconds
    }
  }

  snapshot(viewport: Viewport, move: SinapsiMove): RenderFrame {
    const count = this.graph.nodes.length
    const litCount = (this.activation / 100) * count

    return {
      nodes: this.graph.nodes.map((node) => this.projectNode(node, viewport, litCount)),
      edges: this.graph.edges,
      reveal: this.reveal,
      pulse: move === 'pulse' ? heartbeat(this.pulsePhase) : 0
    }
  }

  private projectNode(node: GraphNode, viewport: Viewport, litCount: number): RenderNode {
    const axis = rotateAroundAxis(this.spinAxis, this.precessAxis, this.precession)
    const world = rotateAroundAxis(this.jittered(node), axis, this.spin)
    return {
      ...project(world, sinapsiConfiguration.motion.camera, viewport, this.sceneRadius),
      weight: node.weight,
      lit: clamp01(litCount - node.rank)
    }
  }

  private jittered(node: GraphNode) {
    const { amplitude, frequency } = sinapsiConfiguration.motion.jitter
    const offset = Math.sin(this.elapsed * frequency + node.jitterPhase) * amplitude
    return add(node.position, scale(node.jitterAxis, offset))
  }
}

export function blendHex(from: string, to: string, amount: number): string {
  const a = parseHex(from)
  const b = parseHex(to)
  const t = clamp01(amount)
  return `#${channel(lerp(a[0], b[0], t))}${channel(lerp(a[1], b[1], t))}${channel(lerp(a[2], b[2], t))}`
}

function perpendicularAxis(axis: Vec3): Vec3 {
  const seed = Math.abs(axis.y) < 0.85 ? vec3(0, 1, 0) : vec3(1, 0, 0)
  return normalize(cross(axis, seed))
}

function parseHex(color: string): [number, number, number] {
  const hex = color.replace('#', '')
  const normalized =
    hex.length === 3 || hex.length === 4
      ? [...hex]
          .map((digit) => digit + digit)
          .join('')
          .slice(0, 6)
      : hex.slice(0, 6)
  const value = Number.parseInt(normalized, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function channel(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0')
}
