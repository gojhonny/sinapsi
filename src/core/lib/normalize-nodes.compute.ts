import { DEFAULT_SINAPSI_NODES, SINAPSI_LIMITS } from '@core/config.data'
import { nodesSchema } from '@domain/schemas/nodes.schema'

import { normalizeProperty } from './normalize-property.compute'

export function normalizeNodes(value: unknown): number {
  return normalizeProperty('nodes', value, nodesSchema, DEFAULT_SINAPSI_NODES, clampAboveMax)
}

function clampAboveMax(value: unknown): number | undefined {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isInteger(numeric) && numeric > SINAPSI_LIMITS.nodes.max) {
    return SINAPSI_LIMITS.nodes.max
  }

  return undefined
}
