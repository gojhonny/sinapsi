import { z } from 'zod'

import { colorSchema } from './color.schema'

/** Complete palette: every token is required. */
export const paletteSchema = z
  .object({
    primary: colorSchema,
    text: colorSchema,
    muted: colorSchema
  })
  .describe('an object with hexadecimal primary, text and muted colors')

/** Consumer overrides for the JavaScript `palette` property: every token is optional. */
export const paletteOverridesSchema = paletteSchema
  .partial()
  .describe('an object with optional hexadecimal primary, text and muted colors')
