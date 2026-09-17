import { DEFAULT_SINAPSI_ACTIVATION } from '@core/config.data'
import { activationSchema } from '@domain/schemas/activation.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeActivation(value: unknown): number {
  return normalizeProperty('activation', value, activationSchema, DEFAULT_SINAPSI_ACTIVATION)
}
