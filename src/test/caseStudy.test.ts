import { describe, it, expect } from 'vitest'
import { formatMonthRange, formatResultPhrase, formatYearRange, nextCaseStudy } from '../lib/caseStudy'
import { caseStudyCard, metric } from './fixtures'

describe('formatYearRange', () => {
  it('joins different years with an en dash', () => {
    expect(formatYearRange('2023-02-01', '2025-01-31', 'Present')).toBe('2023–2025')
  })
  it('shows one year when both dates fall in it', () => {
    expect(formatYearRange('2025-01-01', '2025-09-01', 'Present')).toBe('2025')
  })
  it('ends in the present label while ongoing, and is empty without a start', () => {
    expect(formatYearRange('2025-01-01', null, 'Present')).toBe('2025–Present')
    expect(formatYearRange(null, '2025-01-01', 'Present')).toBe('')
  })
})

describe('formatMonthRange', () => {
  it('formats both months in the reader’s language', () => {
    expect(formatMonthRange('2023-02-01', '2025-01-31', 'Present', 'en')).toBe('Feb 2023 – Jan 2025')
    expect(formatMonthRange('2023-02-01', null, 'Atual', 'pt')).toMatch(/2023 – Atual$/)
  })
})

describe('formatResultPhrase', () => {
  it('lowercases the label after the number', () => {
    expect(formatResultPhrase(metric(90, 'Test coverage', { unit: '%' }), 'en')).toBe('90% test coverage')
    expect(formatResultPhrase(metric(-96, 'Production bugs', { unit: '%' }), 'en')).toBe('−96% production bugs')
    expect(formatResultPhrase(metric(80, 'Screens in Storybook', { unit: '%' }), 'en')).toBe('80% screens in Storybook')
  })
  it('keeps names capitalized', () => {
    expect(formatResultPhrase(metric(95, 'Lighthouse', { qualifier: 'atLeast' }), 'en')).toBe('95+ Lighthouse')
    expect(formatResultPhrase(metric(4.8, 'App Store rating', { before: 3.5 }), 'en')).toBe('3.5 → 4.8 App Store rating')
  })
})

describe('nextCaseStudy', () => {
  const rows = ['a', 'b', 'c'].map((slug) => caseStudyCard({ _id: slug, slug }))
  it('returns the following case study, wrapping around', () => {
    expect(nextCaseStudy(rows, 'a')?.slug).toBe('b')
    expect(nextCaseStudy(rows, 'c')?.slug).toBe('a')
  })
  it('returns null for an unknown slug or a single case study', () => {
    expect(nextCaseStudy(rows, 'z')).toBeNull()
    expect(nextCaseStudy(rows.slice(0, 1), 'a')).toBeNull()
  })
})
