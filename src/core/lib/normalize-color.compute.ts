import { DEFAULT_SINAPSI_PALETTE } from '@core/config.data'
import type { SinapsiColorKey } from '@domain/kernel/properties.types'
import { colorSchema } from '@domain/schemas/color.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeColor(key: SinapsiColorKey, value: unknown): string {
  return normalizeProperty(`color-${key}`, value, colorSchema, DEFAULT_SINAPSI_PALETTE[key])
}
