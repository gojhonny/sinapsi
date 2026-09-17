import { SINAPSI_LIMITS } from '@core/config.data'
import { z } from 'zod'

import { numericSchema } from './numeric.schema'

const { min, max } = SINAPSI_LIMITS.activation

export const activationSchema = numericSchema
  .pipe(z.int().min(min).max(max))
  .describe(`an integer between ${min} and ${max}`)
