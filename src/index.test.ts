/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

describe('core/ssr-entry', () => {
  it('imports without evaluating an HTMLElement subclass', async () => {
    const sinapsi = await import('./index')

    expect(globalThis.HTMLElement).toBeUndefined()
    expect(sinapsi.sinapsiElementClassFactory()).toBeUndefined()
    expect(sinapsi.defineSinapsi()).toBeUndefined()
  })
})
