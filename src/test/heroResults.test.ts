import { describe, expect, it } from 'vitest'
import { stackHeights } from '../components/hero/heroResults'

// 0.35 m on the 2.2 m gauge.
const GAP = 0.35 / 2.2
// Marks in lane order must step down by at least GAP (leaders never cross).
const expectStacked = (h: number[]) =>
  h.slice(1).forEach((v, i) => expect(h[i] - v).toBeGreaterThanOrEqual(GAP - 0.001))

describe('stackHeights', () => {
  it('gives the first result the highest mark and steps the rest down in lane order', () => {
    const out = stackHeights([0.95, 0.96, 0.61])
    expect(out).toEqual([0.96, 0.801, 0.61])
    expectStacked(out)
  })

  it('leaves heights that already step down far enough alone', () => {
    expect(stackHeights([0.9, 0.5, 0.2])).toEqual([0.9, 0.5, 0.2])
  })

  it('keeps every mark above the waterline floor and within the gauge, pushing the stack up', () => {
    const out = stackHeights([0.2, 0.18, 0.16])
    out.forEach((h) => {
      expect(h).toBeGreaterThanOrEqual(0.15)
      expect(h).toBeLessThanOrEqual(1)
    })
    expectStacked(out)
  })

  it('caps the top at the gauge and handles an empty list', () => {
    const out = stackHeights([1, 1, 1])
    expect(out[0]).toBe(1)
    expectStacked(out)
    expect(stackHeights([])).toEqual([])
  })
})
