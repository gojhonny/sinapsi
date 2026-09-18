import { sinapsiConfiguration } from '@core/config.data'
import { createGraph } from '@core/graph/create-graph.compute'
import { createSemanticGraph } from '@core/graph/create-semantic-graph.compute'
import { neighborhoodIds } from '@core/graph/neighborhood.compute'
import { serializeNodesDocument } from '@core/lib/normalize-nodes.compute'
import type { FrameCallback, FrameLoop, Tween } from '@domain/kernel/motion.types'
import type { SinapsiGraphDocument } from '@domain/kernel/nodes.types'
import type { SinapsiMove, SinapsiProperties } from '@domain/kernel/properties.types'
import type { SceneInteraction } from '@domain/kernel/render.types'
import { CanvasRendererService } from '@services/renderer.service'
import { GraphSceneService } from '@services/scene.service'
import { animate, cancelFrame, frame } from 'motion'

const MS_PER_SECOND = 1000

const scheduled = new WeakMap<FrameCallback, FrameCallback>()

const motionLoop: FrameLoop = {
  schedule(callback) {
    const process: FrameCallback = ({ delta }) => {
      callback({ delta })
    }
    scheduled.set(callback, process)
    frame.update(process, true)
  },
  cancel(callback) {
    const process = scheduled.get(callback)
    if (process) {
      cancelFrame(process)
    }
  }
}

const motionTween: Tween = (from, to, durationSeconds, onUpdate) => {
  const controls = animate(from, to, {
    duration: durationSeconds,
    ease: 'easeOut',
    onUpdate
  })
  return { stop: () => controls.stop() }
}

export interface AnimationDependencies {
  readonly loop?: FrameLoop
  readonly tween?: Tween
}

/** Per-instance render loop: rebuilds the graph when density or the nodes document changes. */
export class GraphAnimationService {
  private readonly scene: GraphSceneService
  private readonly renderer: CanvasRendererService
  private readonly loop: FrameLoop
  private readonly tween: Tween
  private readonly tick: FrameCallback
  private properties: SinapsiProperties
  private running = false
  private frozen = false
  private hoverId: string | null = null
  private focusedId: string | null = null
  private activatedIds = new Set<string>()
  private semanticSignature: string | null = null

  constructor(
    canvas: HTMLCanvasElement,
    properties: SinapsiProperties,
    dependencies: AnimationDependencies = {}
  ) {
    this.properties = properties
    this.scene = new GraphSceneService(graphFrom(properties))
    this.semanticSignature = signatureOf(properties.semanticNodes)
    this.renderer = new CanvasRendererService(canvas)
    this.loop = dependencies.loop ?? motionLoop
    this.tween = dependencies.tween ?? motionTween
    this.tick = ({ delta }) => {
      const move = this.effectiveMove()
      if (!this.frozen) {
        this.scene.advance(delta / MS_PER_SECOND, this.properties.move, this.properties.speed)
      }
      this.renderer.render(
        this.scene.snapshot(this.renderer.viewport, move, this.interaction()),
        this.properties.palette
      )
    }
    this.scene.reveal = 0.35
    this.tween(0.35, 1, sinapsiConfiguration.motion.revealSeconds, (value) => {
      this.scene.reveal = value
    })
  }

  start(): void {
    if (this.running) {
      return
    }

    this.running = true
    this.renderer.resize()
    this.loop.schedule(this.tick)
  }

  apply(properties: SinapsiProperties): void {
    const nextSignature = signatureOf(properties.semanticNodes)
    const graphChanged =
      nextSignature !== this.semanticSignature ||
      (nextSignature === null && properties.generatedNodes !== this.properties.generatedNodes)

    if (graphChanged) {
      this.scene.replaceGraph(graphFrom(properties))
      this.semanticSignature = nextSignature
      this.hoverId = null
      this.focusedId = null
      this.activatedIds = new Set()
    }

    this.properties = properties
  }

  setFrozen(frozen: boolean): void {
    this.frozen = frozen
  }

  setHoverId(id: string | null): void {
    this.hoverId = id
  }

  setFocusedId(id: string | null): void {
    this.focusedId = id
  }

  activateNeighborhood(id: string): void {
    const document = this.properties.semanticNodes
    this.activatedIds = document ? new Set(neighborhoodIds(document, id)) : new Set()
  }

  pick(event: PointerEvent): string | null {
    const point = this.renderer.pointerOnCanvas(event)
    return this.renderer.pick(point.x, point.y)
  }

  resize(): void {
    this.renderer.resize()
  }

  dispose(): void {
    if (!this.running) {
      return
    }

    this.running = false
    this.loop.cancel(this.tick)
  }

  private effectiveMove(): SinapsiMove {
    return this.frozen ? 'idle' : this.properties.move
  }

  private interaction(): SceneInteraction {
    const document = this.properties.semanticNodes
    const seed = this.hoverId ?? this.focusedId
    const hoverIds = document && seed ? neighborhoodIds(document, seed) : new Set<string>()
    return {
      hoverIds,
      activatedIds: this.activatedIds,
      focusedId: this.focusedId,
      semantic: document !== null
    }
  }
}

function graphFrom(properties: SinapsiProperties) {
  return properties.semanticNodes
    ? createSemanticGraph(properties.semanticNodes)
    : createGraph(properties.generatedNodes)
}

function signatureOf(document: SinapsiGraphDocument | null): string | null {
  return document ? serializeNodesDocument(document) : null
}
