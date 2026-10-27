import { describe, it, expect } from 'vitest'
import { fieldOf, isRequired } from '../testing'
import type { ValidationContext } from 'sanity'
import { metric, formatMetric, changeHasNoBefore } from './metric'
import { imageWithAlt } from './imageWithAlt'
import { localeBlock } from '../locale/localeBlock'

describe('metric schema', () => {
  it.each(['after', 'label', 'direction'])('requires %s', (name) => {
    expect(isRequired(fieldOf(metric, name))).toBe(true)
  })

  it.each(['before', 'unit', 'qualifier'])('leaves %s optional', (name) => {
    expect(isRequired(fieldOf(metric, name))).toBe(false)
  })

  it('formats before → after with the unit', () => {
    expect(formatMetric({ before: 40, after: 95 })).toBe('40 → 95')
    expect(formatMetric({ before: 23, after: 9, unit: '%' })).toBe('23% → 9%')
  })

  it('prints negatives with a real minus sign (U+2212)', () => {
    expect(formatMetric({ after: -96, unit: '%' })).toBe('\u221296%')
    expect(formatMetric({ before: -2, after: 3 })).toBe('\u22122 → 3')
  })

  it('adds a trailing + for "at least" values', () => {
    expect(formatMetric({ after: 95, qualifier: 'atLeast' })).toBe('95+')
    expect(formatMetric({ after: 80, unit: '%', qualifier: 'atLeast' })).toBe('80%+')
    expect(formatMetric({ before: 40, after: 95, qualifier: 'atLeast' })).toBe('40 → 95+')
  })

  it('always shows the sign of a change', () => {
    expect(formatMetric({ after: 40, unit: '%', qualifier: 'change' })).toBe('+40%')
    expect(formatMetric({ after: -96, unit: '%', qualifier: 'change' })).toBe('\u221296%')
    expect(formatMetric({ after: 0, qualifier: 'change' })).toBe('0')
  })

  it('offers atLeast and change as qualifiers', () => {
    expect(fieldOf(metric, 'qualifier')).toMatchObject({
      options: { list: [{ value: 'atLeast' }, { value: 'change' }] },
    })
  })

  it('rejects a change that also has a before value', () => {
    const withParent = (parent: object) => ({ parent }) as unknown as ValidationContext
    expect(changeHasNoBefore('change', withParent({ before: 10, after: 20 }))).toEqual(expect.any(String))
    expect(changeHasNoBefore('change', withParent({ after: 40 }))).toBe(true)
    expect(changeHasNoBefore('atLeast', withParent({ before: 40, after: 95 }))).toBe(true)
    expect(changeHasNoBefore(undefined, withParent({ before: 40, after: 95 }))).toBe(true)
  })

  it('previews as "40 → 95 · Lighthouse"', () => {
    const preview = metric.preview?.prepare?.({ before: 40, after: 95, unit: undefined, qualifier: undefined, label: 'Lighthouse', direction: 'up' })
    expect(preview?.title).toBe('40 → 95 · Lighthouse')
  })

  it('previews qualified values', () => {
    const preview = metric.preview?.prepare?.({ before: undefined, after: 45, unit: undefined, qualifier: 'atLeast', label: 'Components', direction: 'up' })
    expect(preview?.title).toBe('45+ · Components')
  })
})

describe('imageWithAlt schema', () => {
  it('requires localized alt text and enables hotspot', () => {
    expect(isRequired(fieldOf(imageWithAlt, 'alt'))).toBe(true)
    expect(fieldOf(imageWithAlt, 'alt')).toMatchObject({ type: 'localeString' })
    expect(imageWithAlt.options).toMatchObject({ hotspot: true })
  })
})

describe('localeBlock schema', () => {
  it.each(['en', 'pt', 'es'])('requires the %s sub-field', (name) => {
    expect(isRequired(fieldOf(localeBlock, name))).toBe(true)
  })
})
