import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SINAPSI_NODES, SINAPSI_LIMITS } from '@core/config.data'

import { normalizeNodes } from './normalize-nodes.compute'

describe('core/normalize-nodes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clamps integers above the maximum and reports the substitution', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeNodes(9000)).toBe(SINAPSI_LIMITS.nodes.max)
    expect(error).toHaveBeenCalledWith(
      `[Sinapsi] Invalid nodes=9000: expected an integer between ${SINAPSI_LIMITS.nodes.min} and ${SINAPSI_LIMITS.nodes.max}. Using ${SINAPSI_LIMITS.nodes.max}.`
    )
  })

  it('falls back to the default for non-integers and values below the minimum', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeNodes(3)).toBe(DEFAULT_SINAPSI_NODES)
    expect(normalizeNodes('many')).toBe(DEFAULT_SINAPSI_NODES)
    expect(error).toHaveBeenCalledTimes(2)
  })
})
