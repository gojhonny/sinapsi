import { describe, expect, it } from 'vitest'

import { heartbeat, heartbeatScale } from './heartbeat.compute'

describe('core/heartbeat', () => {
  it('peaks twice per cycle and returns to rest', () => {
    expect(heartbeat(0)).toBeLessThan(0.2)
    expect(heartbeat(0.12)).toBeGreaterThan(0.8)
    expect(heartbeat(0.32)).toBeGreaterThan(0.4)
    expect(heartbeat(0.7)).toBeLessThan(0.1)
  })

  it('maps rest to compact and the peak to expand around size 1', () => {
    expect(heartbeatScale(0, 0.2)).toBe(0.8)
    expect(heartbeatScale(1, 0.2)).toBe(1.2)
    expect(heartbeatScale(0.5, 0.2)).toBe(1)
  })
})
