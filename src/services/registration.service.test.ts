import { SINAPSI_TAG_NAME } from '@core/config.data'
import { sinapsiElementClassFactory } from '@factories/element-class.factory'
import { defineSinapsi } from '@services/registration.service'
import { describe, expect, it } from 'vitest'

describe('service/registration', () => {
  it('defines the custom element once', () => {
    const first = defineSinapsi()
    const second = defineSinapsi()

    expect(first).toBe(sinapsiElementClassFactory())
    expect(second).toBe(first)
    expect(customElements.get(SINAPSI_TAG_NAME)).toBe(first)
  })
})
