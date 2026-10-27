import { describe, expect, it } from 'vitest'
import { spaceHeights } from '../components/hero/heroResults'

// 0.35 m on the 2.2 m gauge.
const GAP = 0.35 / 2.2
const gaps = (h: number[]) => {
  const s = [...h].sort((a, b) => b - a)
  return s.slice(1).map((v, i) => s[i] - v)
}

describe('spaceHeights', () => {
  it('moves the lower of two near-equal marks down, keeping the order', () => {
    const out = spaceHeights([0.95, 0.96, 0.61])
    expect(out).toEqual([0.801, 0.96, 0.61])
    expect(out[1]).toBeGreaterThan(out[0])
    gaps(out).forEach((g) => expect(g).toBeGreaterThanOrEqual(GAP - 0.001))
  })

  it('leaves marks that are already apart alone', () => {
    expect(spaceHeights([0.9, 0.5, 0.2])).toEqual([0.9, 0.5, 0.2])
  })

  it('keeps every mark above the waterline floor and within the gauge, pushing the stack up', () => {
    const out = spaceHeights([0.2, 0.18, 0.16])
    out.forEach((h) => {
      expect(h).toBeGreaterThanOrEqual(0.15)
      expect(h).toBeLessThanOrEqual(1)
    })
    expect(out[0]).toBeGreaterThan(out[1])
    expect(out[1]).toBeGreaterThan(out[2])
    gaps(out).forEach((g) => expect(g).toBeGreaterThanOrEqual(GAP - 0.001))
  })

  it('breaks ties by order and caps at the gauge top', () => {
    const out = spaceHeights([1, 1, 1])
    expect(out[0]).toBe(1)
    expect(out[1]).toBeCloseTo(1 - GAP, 2)
    expect(out[2]).toBeCloseTo(1 - 2 * GAP, 2)
  })
})
