import { DEFAULT_SINAPSI_MOVE } from '@core/config.data'
import type { SinapsiMove } from '@domain/kernel/properties.types'
import { moveSchema } from '@domain/schemas/move.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeMove(value: unknown): SinapsiMove {
  return normalizeProperty('move', value, moveSchema, DEFAULT_SINAPSI_MOVE)
}
