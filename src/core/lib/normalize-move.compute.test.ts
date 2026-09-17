import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SINAPSI_MOVE } from '@core/config.data'

import { normalizeMove } from './normalize-move.compute'

describe('core/normalize-move', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts idle, rotate and pulse', () => {
    expect(normalizeMove('idle')).toBe('idle')
    expect(normalizeMove(' rotate ')).toBe('rotate')
    expect(normalizeMove('pulse')).toBe('pulse')
  })

  it('falls back to rotate and reports invalid input', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeMove('spin')).toBe(DEFAULT_SINAPSI_MOVE)
    expect(error).toHaveBeenCalledOnce()
  })
})
