import { sinapsiConfiguration } from '@core/config.data'
import { createGraph } from '@core/graph/create-graph.compute'
import type { FrameCallback, FrameLoop, Tween } from '@domain/kernel/motion.types'
import type { SinapsiProperties } from '@domain/kernel/properties.types'
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

/** Per-instance render loop: rebuilds the graph when density changes and tweens activation. */
export class GraphAnimationService {
  private readonly scene: GraphSceneService
  private readonly renderer: CanvasRendererService
  private readonly loop: FrameLoop
  private readonly tween: Tween
  private readonly tick: FrameCallback
  private properties: SinapsiProperties
  private activationTween?: { stop(): void }
  private running = false

  constructor(
    canvas: HTMLCanvasElement,
    properties: SinapsiProperties,
    dependencies: AnimationDependencies = {}
  ) {
    this.properties = properties
    this.scene = new GraphSceneService(createGraph(properties.nodes))
    this.renderer = new CanvasRendererService(canvas)
    this.loop = dependencies.loop ?? motionLoop
    this.tween = dependencies.tween ?? motionTween
    this.tick = ({ delta }) => {
      this.scene.advance(delta / MS_PER_SECOND, this.properties.move, this.properties.speed)
      this.renderer.render(
        this.scene.snapshot(this.renderer.viewport, this.properties.move),
        this.properties.palette
      )
    }
    this.scene.reveal = 0.35
    this.tween(0.35, 1, sinapsiConfiguration.motion.revealSeconds, (value) => {
      this.scene.reveal = value
    })
    this.scene.activation = properties.activation
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
    if (properties.nodes !== this.properties.nodes) {
      this.scene.replaceGraph(createGraph(properties.nodes))
    }

    if (properties.activation !== this.properties.activation) {
      this.activationTween?.stop()
      const from = this.scene.activation
      this.activationTween = this.tween(
        from,
        properties.activation,
        sinapsiConfiguration.motion.activationSeconds,
        (value) => {
          this.scene.activation = value
        }
      )
    }

    this.properties = properties
  }

  resize(): void {
    this.renderer.resize()
  }

  dispose(): void {
    if (!this.running) {
      return
    }

    this.running = false
    this.activationTween?.stop()
    this.loop.cancel(this.tick)
  }
}
