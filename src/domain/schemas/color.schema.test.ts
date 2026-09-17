import { describe, expect, it } from 'vitest'

import { colorSchema } from './color.schema'

describe('schema/color', () => {
  it('accepts 3, 4, 6 and 8 digit hex colors', () => {
    expect(colorSchema.parse('#F97')).toBe('#F97')
    expect(colorSchema.parse('#F973')).toBe('#F973')
    expect(colorSchema.parse('#F97316')).toBe('#F97316')
    expect(colorSchema.parse('#F97316FF')).toBe('#F97316FF')
  })

  it('rejects non-hex colors', () => {
    expect(colorSchema.safeParse('rgb(249, 115, 22)').success).toBe(false)
  })
})
