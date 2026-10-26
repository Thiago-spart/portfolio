import { describe, it, expect } from 'vitest'
import { fieldOf, isRequired } from '../testing'
import { metric, formatMetric } from './metric'
import { imageWithAlt } from './imageWithAlt'
import { localeBlock } from '../locale/localeBlock'

describe('metric schema', () => {
  it.each(['after', 'label', 'direction'])('requires %s', (name) => {
    expect(isRequired(fieldOf(metric, name))).toBe(true)
  })

  it.each(['before', 'unit'])('leaves %s optional', (name) => {
    expect(isRequired(fieldOf(metric, name))).toBe(false)
  })

  it('formats before → after with the unit', () => {
    expect(formatMetric({ before: 40, after: 95 })).toBe('40 → 95')
    expect(formatMetric({ before: 23, after: 9, unit: '%' })).toBe('23% → 9%')
    expect(formatMetric({ after: -96, unit: '%' })).toBe('-96%')
  })

  it('previews as "40 → 95 · Lighthouse"', () => {
    const preview = metric.preview?.prepare?.({ before: 40, after: 95, unit: undefined, label: 'Lighthouse', direction: 'up' })
    expect(preview?.title).toBe('40 → 95 · Lighthouse')
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
