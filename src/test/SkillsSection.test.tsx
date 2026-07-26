// src/test/SkillsSection.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import SkillsSection from '../components/SkillsSection'
import type { SanitySkillCategory } from '../types/sanity'

const mockCategories: SanitySkillCategory[] = []

describe('SkillsSection', () => {
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(
      <LanguageProvider>
        <SkillsSection categories={mockCategories} lang="en" />
      </LanguageProvider>,
    )
    expect(container.querySelector('#skills')).toHaveClass('cyberpunk-surface')
  })
})
