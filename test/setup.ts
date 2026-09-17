import { afterEach, beforeEach, vi } from 'vitest'

function createTestContext(): CanvasRenderingContext2D {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    lineCap: 'butt',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: ''
  } as unknown as CanvasRenderingContext2D
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string): MediaQueryList => {
      return {
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn()
      }
    })
  )

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
  )

  if (typeof globalThis.HTMLCanvasElement !== 'undefined') {
    Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => createTestContext()),
      writable: true
    })
  }
})

afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.replaceChildren()
  }

  vi.unstubAllGlobals()
})
