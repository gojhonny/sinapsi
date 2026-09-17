import type { GraphzMove } from '@domain/kernel/properties.types'
import { z } from 'zod'

export const GRAPHZ_MOVES = ['idle', 'rotate', 'pulse'] as const satisfies readonly GraphzMove[]

export const moveSchema = z
  .string()
  .trim()
  .pipe(z.enum(GRAPHZ_MOVES))
  .describe(`one of ${GRAPHZ_MOVES.join(', ')}`)
