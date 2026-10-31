import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { formatMetric, formatMetricParts } from '../lib/metric'
import { Metric } from '../components/ui/Metric'

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

describe('formatMetricParts', () => {
  it('splits before and after, each with the unit', () => {
    expect(formatMetricParts({ before: 23, after: 9, unit: '%' })).toEqual({ before: '23%', after: '9%' })
  })

  it('has no before for a single value', () => {
    expect(formatMetricParts({ after: 95, qualifier: 'atLeast' })).toEqual({ before: null, after: '95+' })
  })

  it('uses a real minus sign on either side', () => {
    const parts = formatMetricParts({ before: -3, after: -96, unit: '%' })
    expect(parts).toEqual({ before: '−3%', after: '−96%' })
    expect(parts.before).not.toContain('-')
    expect(parts.after).not.toContain('-')
  })
})

describe('Metric', () => {
  it('renders a delta: the before value struck through, then the after value', () => {
    render(<Metric label="Lighthouse" value={{ before: 40, after: 95 }} />)
    const before = screen.getByText('40')
    expect(before.tagName).toBe('S')
    expect(before).toHaveClass('text-ink-muted')
    expect(screen.getByText('95')).toHaveClass('type-metric')
    expect(screen.getByText('→')).toHaveAttribute('aria-hidden', 'true')
  })

  it('reads "40 to 95" to assistive tech', () => {
    const { container } = render(<Metric label="Lighthouse" value={{ before: 40, after: 95 }} />)
    const values = container.querySelectorAll('p')[1]
    // Every text node not inside an aria-hidden element.
    const walker = document.createTreeWalker(values, NodeFilter.SHOW_TEXT)
    let spoken = ''
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement?.closest('[aria-hidden="true"]')) spoken += walker.currentNode.textContent
    }
    expect(spoken.replace(/\s+/g, ' ')).toBe('40 to 95')
  })

  it('renders a single value without a before or an arrow', () => {
    render(<Metric label="Production bugs" value={{ after: -96, unit: '%' }} />)
    expect(screen.getByText('−96%')).toBeInTheDocument()
    expect(screen.queryByText('→')).toBeNull()
    expect(document.querySelector('s')).toBeNull()
  })

  it('puts the after value in mango only with the accent emphasis', () => {
    const { rerender } = render(<Metric label="Lighthouse" value={{ after: 95 }} />)
    expect(screen.getByText('95')).toHaveClass('text-ink')
    rerender(<Metric label="Lighthouse" value={{ after: 95 }} emphasis="accent" />)
    expect(screen.getByText('95')).toHaveClass('text-mango')
  })

  it('renders the label as a wrapping eyebrow and an optional description', () => {
    render(
      <Metric
        label="Largest Contentful Paint"
        value={{ after: 0.9, unit: 's' }}
        description="Public platform on Vite SSR."
      />,
    )
    const label = screen.getByText('Largest Contentful Paint')
    expect(label).toHaveClass('type-label')
    expect(label).not.toHaveClass('whitespace-nowrap')
    expect(screen.getByText('Public platform on Vite SSR.')).toHaveClass('type-small')
  })
})
