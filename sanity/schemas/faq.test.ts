import { describe, it, expect } from 'vitest'
import { fieldOf, isRequired, ruleCalls } from './testing'
import { faq } from './faq'

describe('faq schema', () => {
  it.each(['question', 'answer'])('requires %s', (name) => {
    expect(isRequired(fieldOf(faq, name))).toBe(true)
  })

  it('links up to two distinct case studies, optionally', () => {
    const field = fieldOf(faq, 'caseStudies')
    expect(isRequired(field)).toBe(false)
    expect(field).toMatchObject({ type: 'array', of: [{ type: 'reference', to: [{ type: 'caseStudy' }] }] })
    expect(ruleCalls(field.validation)).toEqual([
      { method: 'max', args: [2] },
      { method: 'unique', args: [] },
    ])
  })

  it('answers in localized rich text', () => {
    expect(fieldOf(faq, 'answer')).toMatchObject({ type: 'localeBlock' })
  })
})
