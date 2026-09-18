import { z } from 'zod'

import { moveSchema } from './move.schema'
import { paletteSchema } from './palette.schema'

const CUSTOM_ELEMENT_NAME = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/

const positive = z.number().positive()
const nonNegative = z.number().min(0)
const fraction = z.number().min(0).max(1)

const rangeSchema = z
  .object({ min: z.number(), max: z.number() })
  .refine(({ min, max }) => min < max, 'min must be lower than max')

const integerRangeSchema = z
  .object({ min: z.int().min(0), max: z.int() })
  .refine(({ min, max }) => min < max, 'min must be lower than max')

const within = (value: number, range: { min: number; max: number }): boolean =>
  value >= range.min && value <= range.max

const componentSchema = z
  .object({
    tagName: z.string().regex(CUSTOM_ELEMENT_NAME, 'expected a valid custom element name'),
    defaults: z.object({
      move: moveSchema,
      speed: positive,
      nodes: z.int().positive(),
      activation: z.int().min(0)
    }),
    limits: z.object({
      speed: rangeSchema,
      nodes: integerRangeSchema,
      activation: integerRangeSchema
    })
  })
  .refine(
    ({ defaults, limits }) =>
      within(defaults.speed, limits.speed) &&
      within(defaults.nodes, limits.nodes) &&
      within(defaults.activation, limits.activation),
    'defaults must stay within their limits'
  )

/** Validates `src/sinapsi.config.json`; a violation is a build-time defect and throws. */
export const configurationSchema = z.object({
  component: componentSchema,
  palette: paletteSchema,
  graph: z.object({
    neighborsPerNode: z.int().min(1),
    shape: z.object({ radius: positive, roughness: fraction })
  }),
  motion: z.object({
    secondsPerTurn: positive,
    tilt: z.number(),
    jitter: z.object({ amplitude: nonNegative, frequency: nonNegative }),
    beatsPerMinute: positive,
    pulseScale: fraction,
    revealSeconds: nonNegative,
    activationSeconds: nonNegative,
    camera: z.object({ distance: positive, focalLength: positive, zoom: positive })
  })
})
