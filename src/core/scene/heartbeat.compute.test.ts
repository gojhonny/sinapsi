import { describe, expect, it } from 'vitest'

import { heartbeat } from './heartbeat.compute'

describe('core/heartbeat', () => {
  it('peaks twice per cycle and returns to rest', () => {
    expect(heartbeat(0)).toBeLessThan(0.2)
    expect(heartbeat(0.12)).toBeGreaterThan(0.8)
    expect(heartbeat(0.32)).toBeGreaterThan(0.4)
    expect(heartbeat(0.7)).toBeLessThan(0.1)
  })
})
