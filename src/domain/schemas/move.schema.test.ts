import { describe, expect, it } from 'vitest'

import { moveSchema } from './move.schema'

describe('schema/move', () => {
  it('accepts the three motion programs', () => {
    expect(moveSchema.parse('idle')).toBe('idle')
    expect(moveSchema.parse('rotate')).toBe('rotate')
    expect(moveSchema.parse('pulse')).toBe('pulse')
  })

  it('rejects unknown programs', () => {
    expect(moveSchema.safeParse('spin').success).toBe(false)
  })
})
