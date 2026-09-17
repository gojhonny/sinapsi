import { sinapsiConfiguration } from '@core/config.data'
import { clamp01, lerp } from '@core/math/scalar.compute'
import { add, length, rotateX, rotateZ, scale } from '@core/math/vector3.compute'
import { heartbeat } from '@core/scene/heartbeat.compute'
import { project } from '@core/scene/projection.compute'
import type { Graph, GraphNode } from '@domain/kernel/graph.types'
import type { SinapsiMove } from '@domain/kernel/properties.types'
import type { RenderFrame, RenderNode, Viewport } from '@domain/kernel/render.types'

const TWO_PI = Math.PI * 2

/** Owns the time-dependent state of the graph and projects it for rendering. */
export class GraphSceneService {
  reveal = 0
  activation = 0

  private sceneRadius: number
  private readonly rotation = { x: 0, y: 0, z: 0 }
  private elapsed = 0
  private pulsePhase = 0

  constructor(private graph: Graph) {
    this.sceneRadius = Math.max(...graph.nodes.map((node) => length(node.position)), 1)
  }

  replaceGraph(graph: Graph): void {
    this.graph = graph
    this.sceneRadius = Math.max(...graph.nodes.map((node) => length(node.position)), 1)
  }

  advance(deltaSeconds: number, move: SinapsiMove, speed: number): void {
    this.elapsed += deltaSeconds
    const { secondsPerTurn, tilt } = sinapsiConfiguration.motion
    const yawSpeed = (TWO_PI / secondsPerTurn) * speed

    if (move === 'rotate') {
      this.rotation.z += yawSpeed * deltaSeconds
      this.rotation.x += yawSpeed * tilt * deltaSeconds
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
    const world = rotateX(rotateZ(this.jittered(node), this.rotation.z), this.rotation.x)
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
