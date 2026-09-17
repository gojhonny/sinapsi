import { DEFAULT_GRAPHZ_MOVE } from '@core/config.data'
import type { GraphzMove } from '@domain/kernel/properties.types'
import { moveSchema } from '@domain/schemas/move.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeMove(value: unknown): GraphzMove {
  return normalizeProperty('move', value, moveSchema, DEFAULT_GRAPHZ_MOVE)
}
