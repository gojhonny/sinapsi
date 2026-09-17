import source from '@configuration'
import { deepFreeze } from '@core/lib/deep-freeze.compute'
import type { GraphzConfiguration } from '@domain/kernel/config.types'
import type { GraphzColorKey } from '@domain/kernel/properties.types'
import { configurationSchema } from '@domain/schemas/configuration.schema'

/** Runtime configuration validated and frozen once from the canonical JSON. */
export const graphzConfiguration: GraphzConfiguration = deepFreeze(
  configurationSchema.parse(source)
)

export const GRAPHZ_TAG_NAME = graphzConfiguration.component.tagName

export const GRAPHZ_LIMITS = graphzConfiguration.component.limits

export const DEFAULT_GRAPHZ_MOVE = graphzConfiguration.component.defaults.move

export const DEFAULT_GRAPHZ_SPEED = graphzConfiguration.component.defaults.speed

export const DEFAULT_GRAPHZ_NODES = graphzConfiguration.component.defaults.nodes

export const DEFAULT_GRAPHZ_ACTIVATION = graphzConfiguration.component.defaults.activation

export const DEFAULT_GRAPHZ_PALETTE = graphzConfiguration.palette

export const GRAPHZ_COLOR_KEYS = ['primary', 'text', 'muted'] as const satisfies readonly GraphzColorKey[]

export const GRAPHZ_COLOR_ATTRIBUTES = {
  primary: 'color-primary',
  text: 'color-text',
  muted: 'color-muted'
} as const satisfies Record<GraphzColorKey, `color-${GraphzColorKey}`>

export const GRAPHZ_PROPERTY_ATTRIBUTES = ['move', 'speed', 'nodes', 'activation'] as const

export const GRAPHZ_OBSERVED_ATTRIBUTES: readonly string[] = [
  ...GRAPHZ_COLOR_KEYS.map((key) => GRAPHZ_COLOR_ATTRIBUTES[key]),
  ...GRAPHZ_PROPERTY_ATTRIBUTES
]
