import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SINAPSI_PALETTE } from '@core/config.data'

import { normalizeColor } from './normalize-color.compute'

describe('core/normalize-color', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('trims hexadecimal colors', () => {
    expect(normalizeColor('primary', ' #abc ')).toBe('#abc')
  })

  it('falls back to the default token for invalid colors', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeColor('primary', 'orange')).toBe(DEFAULT_SINAPSI_PALETTE.primary)
    expect(error).toHaveBeenCalledOnce()
  })
})
