import { describe, it, expect } from 'vitest'
import type { ValidationContext } from 'sanity'
import { fieldOf, isRequired } from './testing'
import { caseStudy, requiredWhenFeatured } from './caseStudy'
import { role } from './role'
import { endAfterStart, yearRange } from './dates'

const withDocument = (document: Record<string, unknown>) =>
  ({ document: { _id: 'x', _type: 'caseStudy', ...document } }) as unknown as ValidationContext

describe('caseStudy schema', () => {
  it.each(['title', 'slug', 'tier'])('requires %s', (name) => {
    expect(isRequired(fieldOf(caseStudy, name))).toBe(true)
  })

  it('sources the slug from the English title', () => {
    expect(fieldOf(caseStudy, 'slug')).toMatchObject({ options: { source: 'title.en' } })
  })

  it('defaults to the archive tier', () => {
    expect(fieldOf(caseStudy, 'tier')).toMatchObject({ initialValue: 'archive' })
  })

  describe('featured tier', () => {
    const needsCover = requiredWhenFeatured('cover')
    const featured = withDocument({ tier: 'featured' })
    const archive = withDocument({ tier: 'archive' })

    it('requires a value only when featured', () => {
      expect(needsCover(undefined, featured)).toBe('cover')
      expect(needsCover([], featured)).toBe('cover')
      expect(needsCover(undefined, archive)).toBe(true)
      expect(needsCover([{ after: 1 }], featured)).toBe(true)
    })
  })

  it('previews tier and role company', () => {
    expect(caseStudy.preview?.prepare?.({ title: 'Checkout', tier: 'featured', company: 'Acme', media: undefined }))
      .toMatchObject({ title: 'Checkout', subtitle: 'Featured · Acme' })
  })
})

describe('role schema', () => {
  it.each(['company', 'title', 'startDate'])('requires %s', (name) => {
    expect(isRequired(fieldOf(role, name))).toBe(true)
  })

  it('rejects an end date before the start date', () => {
    const context = withDocument({ startDate: '2022-05-01' })
    expect(endAfterStart('2021-01-01', context)).toMatch(/after the start date/)
    expect(endAfterStart('2023-01-01', context)).toBe(true)
    expect(endAfterStart(undefined, context)).toBe(true)
  })

  it('formats the year range', () => {
    expect(yearRange('2021-03-01', '2023-07-01')).toBe('2021–2023')
    expect(yearRange('2024-01-01')).toBe('2024–now')
  })
})
