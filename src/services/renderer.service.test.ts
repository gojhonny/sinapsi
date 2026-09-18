import { DEFAULT_SINAPSI_PALETTE } from '@core/config.data'
import type { RenderFrame } from '@domain/kernel/render.types'
import { CanvasRendererService } from '@services/renderer.service'
import { afterEach, describe, expect, it, vi } from 'vitest'

const palette = DEFAULT_SINAPSI_PALETTE

const labeledFrame: RenderFrame = {
  nodes: [
    {
      id: 'pricing',
      name: 'Pricing',
      x: 80,
      y: 90,
      depth: 0.4,
      weight: 0.8,
      lit: 1,
      emphasized: true,
      dimmed: false,
      labeled: true
    },
    {
      id: 'search',
      name: 'Search',
      x: 140,
      y: 90,
      depth: 0.5,
      weight: 0.3,
      lit: 0.45,
      emphasized: true,
      dimmed: false,
      labeled: false
    }
  ],
  edges: [{ source: 0, target: 1 }],
  reveal: 1,
  pulse: 0
}

function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 48 })),
    font: '',
    lineCap: 'butt',
    lineJoin: 'miter',
    lineWidth: 1,
    strokeStyle: '',
    fillStyle: '',
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline
  }
}

describe('service/renderer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('paints click names inside discs and never strokes node circles', () => {
    const ctx = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D
    )
    const canvas = document.createElement('canvas')
    Object.defineProperty(canvas, 'clientWidth', { value: 200 })
    Object.defineProperty(canvas, 'clientHeight', { value: 200 })
    const renderer = new CanvasRendererService(canvas)

    renderer.render(labeledFrame, palette)

    expect(ctx.fillText).toHaveBeenCalledTimes(1)
    expect(ctx.fillText).toHaveBeenCalledWith('Pricing', 80, 90)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
    expect(ctx.fill).toHaveBeenCalledTimes(2)
    expect(ctx.arc).toHaveBeenCalledTimes(2)
  })
})
