import type { RenderNode } from '@domain/kernel/render.types'
import { describe, expect, it } from 'vitest'
import { fitProjection } from './fit-projection.compute'

function node(id: string, x: number, y: number): RenderNode {
  return {
    id,
    name: id,
    x,
    y,
    depth: 0.5,
    weight: 1,
    lit: 0,
    emphasized: false,
    dimmed: false,
    focused: false,
    selected: false,
    labeled: false
  }
}

describe('core/fit-projection', () => {
  it('fits and centers an off-center wide network with conservative padding', () => {
    const source = [node('a', 200, 210), node('b', 260, 230), node('c', 320, 250)]
    const fitted = fitProjection(source, { width: 580, height: 483 })
    expect(fitted[0].x).toBeCloseTo(24)
    expect(fitted[2].x).toBeCloseTo(556)
    expect((fitted[0].y + fitted[2].y) / 2).toBeCloseTo(241.5)
    expect((fitted[2].x - fitted[0].x) / (fitted[2].y - fitted[0].y)).toBeCloseTo(3)
    expect(fitted[1]).toMatchObject({ id: 'b', depth: 0.5, weight: 1, selected: false })
    expect(source[0]).toMatchObject({ x: 200, y: 210 })
  })

  it('fits tall and zero-width networks without stretching axes independently', () => {
    const fitted = fitProjection([node('a', 80, 20), node('b', 80, 100)], {
      width: 200,
      height: 400
    })
    expect(fitted.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 100, y: 24 },
      { x: 100, y: 376 }
    ])
  })

  it('keeps empty, singleton, coincident and zero-size frames finite', () => {
    expect(fitProjection([], { width: 200, height: 400 })).toEqual([])
    expect(fitProjection([node('one', 82, 123)], { width: 200, height: 400 })[0]).toMatchObject({
      x: 100,
      y: 200
    })
    const coincident = fitProjection([node('a', 10, 10), node('b', 10, 10)], {
      width: 200,
      height: 400
    })
    expect(coincident.every((entry) => entry.x === 100 && entry.y === 200)).toBe(true)
    const hidden = fitProjection([node('a', 10, 20), node('b', 20, 30)], { width: 0, height: 0 })
    expect(hidden.every((entry) => entry.x === 0 && entry.y === 0)).toBe(true)
  })
})
