import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SINAPSI_ACTIVATION } from '@core/config.data'

import { normalizeActivation } from './normalize-activation.compute'

describe('core/normalize-activation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts integers from 0 to 100', () => {
    expect(normalizeActivation(0)).toBe(0)
    expect(normalizeActivation('40')).toBe(40)
    expect(normalizeActivation(100)).toBe(100)
  })

  it('falls back to 0 for values outside 0..100', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeActivation(-1)).toBe(DEFAULT_SINAPSI_ACTIVATION)
    expect(normalizeActivation(101)).toBe(DEFAULT_SINAPSI_ACTIVATION)
    expect(error).toHaveBeenCalledTimes(2)
  })
})
