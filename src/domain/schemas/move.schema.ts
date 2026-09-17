import type { SinapsiMove } from '@domain/kernel/properties.types'
import { z } from 'zod'

export const SINAPSI_MOVES = ['idle', 'rotate', 'pulse'] as const satisfies readonly SinapsiMove[]

export const moveSchema = z
  .string()
  .trim()
  .pipe(z.enum(SINAPSI_MOVES))
  .describe(`one of ${SINAPSI_MOVES.join(', ')}`)
