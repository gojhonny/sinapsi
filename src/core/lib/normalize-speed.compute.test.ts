import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SINAPSI_SPEED } from '@core/config.data'

import { normalizeSpeed } from './normalize-speed.compute'

describe('core/normalize-speed', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses numeric attribute strings inside the supported range', () => {
    expect(normalizeSpeed('1.5')).toBe(1.5)
    expect(normalizeSpeed(10)).toBe(10)
  })

  it('falls back to the default for non-positive or oversized values', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeSpeed(0)).toBe(DEFAULT_SINAPSI_SPEED)
    expect(normalizeSpeed(11)).toBe(DEFAULT_SINAPSI_SPEED)
    expect(error).toHaveBeenCalledTimes(2)
  })
})
