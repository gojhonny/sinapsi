import { z } from 'zod'

const NUMERIC_TEXT = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i

/** Accepts finite numbers and numeric attribute strings such as `"1.5"`. */
export const numericSchema = z.union([
  z.number(),
  z.string().trim().regex(NUMERIC_TEXT).transform(Number).pipe(z.number())
])

export const integerSchema = numericSchema.pipe(z.int())
