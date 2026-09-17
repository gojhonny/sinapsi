import { DEFAULT_SINAPSI_PALETTE, SINAPSI_COLOR_KEYS } from '@core/config.data'
import type { SinapsiPalette, SinapsiPaletteOverrides } from '@domain/kernel/properties.types'
import { paletteOverridesSchema } from '@domain/schemas/palette.schema'

import { normalizeColor } from './normalize-color.compute'
import { normalizeProperty } from './normalize-property.compute'

export function normalizePalette(value: unknown): SinapsiPalette {
  const overrides = normalizeProperty(
    'palette',
    value,
    paletteOverridesSchema,
    {} satisfies SinapsiPaletteOverrides
  )

  const palette = { ...DEFAULT_SINAPSI_PALETTE }
  for (const key of SINAPSI_COLOR_KEYS) {
    if (overrides[key] !== undefined) {
      palette[key] = normalizeColor(key, overrides[key])
    }
  }

  return palette
}
