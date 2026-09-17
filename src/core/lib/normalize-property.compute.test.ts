import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { normalizeProperty } from './normalize-property.compute'

describe('core/normalize-property', () => {
  const schema = z
    .string()
    .trim()
    .pipe(z.enum(['rotate']))
    .describe('one of rotate')
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the fallback silently for absent values', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeProperty('move', null, schema, 'rotate')).toBe('rotate')
    expect(normalizeProperty('move', undefined, schema, 'rotate')).toBe('rotate')
    expect(error).not.toHaveBeenCalled()
  })

  it('reports invalid values and uses recover when provided', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(
      normalizeProperty(
        'nodes',
        9000,
        z.int().max(400).describe('an integer between 8 and 400'),
        170,
        () => 400
      )
    ).toBe(400)
    expect(error).toHaveBeenCalledWith(
      '[Sinapsi] Invalid nodes=9000: expected an integer between 8 and 400. Using 400.'
    )
  })
})
