import { DEFAULT_SINAPSI_PALETTE } from '@core/config.data'
import type { FrameCallback } from '@domain/kernel/motion.types'
import type { SinapsiProperties } from '@domain/kernel/properties.types'
import { GraphAnimationService } from '@services/animation.service'
import { GraphSceneService } from '@services/scene.service'
import { describe, expect, it, vi } from 'vitest'

describe('service/animation', () => {
  it('skips scene advance while frozen', () => {
    const advance = vi.spyOn(GraphSceneService.prototype, 'advance')
    let tick: FrameCallback = () => undefined
    const canvas = document.createElement('canvas')
    Object.defineProperty(canvas, 'clientWidth', { value: 200 })
    Object.defineProperty(canvas, 'clientHeight', { value: 200 })

    const properties: SinapsiProperties = {
      palette: DEFAULT_SINAPSI_PALETTE,
      move: 'rotate',
      speed: 1,
      generatedNodes: 12,
      semanticNodes: null
    }

    const service = new GraphAnimationService(canvas, properties, {
      loop: {
        schedule(callback) {
          tick = callback
        },
        cancel() {}
      },
      tween: () => ({ stop() {} })
    })

    service.start()
    tick({ delta: 16 })
    expect(advance).toHaveBeenCalled()

    service.setFrozen(true)
    advance.mockClear()
    tick({ delta: 16 })
    expect(advance).not.toHaveBeenCalled()
  })
})
