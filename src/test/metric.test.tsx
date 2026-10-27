import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { formatMetric } from '../lib/metric'
import MetricTile from '../components/MetricTile'

describe('formatMetric', () => {
  it('shows "before → after" when there is a before value', () => {
    expect(formatMetric({ before: 40, after: 95 })).toBe('40 → 95')
  })

  it('appends the unit to both values', () => {
    expect(formatMetric({ before: 23, after: 9, unit: '%' })).toBe('23% → 9%')
    expect(formatMetric({ before: 3.2, after: 1.1, unit: 's' })).toBe('3.2s → 1.1s')
  })

  it('shows only the after value without a before', () => {
    expect(formatMetric({ before: null, after: 3, unit: null })).toBe('3')
  })

  it('prints negatives with a real minus sign (U+2212), not a hyphen', () => {
    expect(formatMetric({ after: -96, unit: '%' })).toBe('\u221296%')
    expect(formatMetric({ after: -96, unit: '%' })).not.toContain('-')
    expect(formatMetric({ after: -96, unit: '%', qualifier: 'change' })).toBe('−96%')
  })

  it('adds a trailing + for "at least" values', () => {
    expect(formatMetric({ after: 95, qualifier: 'atLeast' })).toBe('95+')
    expect(formatMetric({ after: 80, unit: '%', qualifier: 'atLeast' })).toBe('80%+')
  })

  it('shows the sign of a positive change', () => {
    expect(formatMetric({ after: 40, unit: '%', qualifier: 'change' })).toBe('+40%')
    expect(formatMetric({ after: 40, unit: '%', qualifier: null })).toBe('40%')
  })

  it('treats a before of 0 as a value, not as missing', () => {
    expect(formatMetric({ before: 0, after: 12 })).toBe('0 → 12')
  })
})

describe('MetricTile', () => {
  it('renders the value, the label and the direction', () => {
    render(<MetricTile metric={{ before: 23, after: 9, unit: '%', direction: 'down' }} label="Checkout drop-off" />)
    const value = screen.getByText('23% → 9%')
    expect(screen.getByText('Checkout drop-off')).toBeInTheDocument()
    expect(value.parentElement).toHaveAttribute('data-direction', 'down')
  })

  it('renders qualified values', () => {
    render(<MetricTile metric={{ after: 95, qualifier: 'atLeast', direction: 'up' }} label="Lighthouse score" />)
    expect(screen.getByText('95+')).toBeInTheDocument()
  })
})
