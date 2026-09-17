import { z } from 'zod'

export const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

export const colorSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN)
  .describe('a hexadecimal CSS color such as #F97316')
