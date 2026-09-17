import { GRAPHZ_LIMITS } from '@core/config.data'
import { z } from 'zod'

import { numericSchema } from './numeric.schema'

const { min, max } = GRAPHZ_LIMITS.speed

export const speedSchema = numericSchema
  .pipe(z.number().min(min).max(max))
  .describe(`a number between ${min} and ${max}`)
