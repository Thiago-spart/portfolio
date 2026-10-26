import { describe, it, expect } from 'vitest'
import { fieldOf, isRequired } from './testing'
import { faq } from './faq'

describe('faq schema', () => {
  it.each(['question', 'answer'])('requires %s', (name) => {
    expect(isRequired(fieldOf(faq, name))).toBe(true)
  })

  it('answers in localized rich text', () => {
    expect(fieldOf(faq, 'answer')).toMatchObject({ type: 'localeBlock' })
  })
})
