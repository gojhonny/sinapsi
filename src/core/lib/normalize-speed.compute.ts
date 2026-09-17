import { DEFAULT_SINAPSI_SPEED } from '@core/config.data'
import { speedSchema } from '@domain/schemas/speed.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeSpeed(value: unknown): number {
  return normalizeProperty('speed', value, speedSchema, DEFAULT_SINAPSI_SPEED)
}
