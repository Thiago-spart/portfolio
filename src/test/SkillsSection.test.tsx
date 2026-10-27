// src/test/SkillsSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import SkillsSection from '../components/SkillsSection'
import { groupStack } from '../lib/stack'

describe('SkillsSection', () => {
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(
      <LanguageProvider>
        <SkillsSection groups={[]} lang="en" />
      </LanguageProvider>,
    )
    expect(container.querySelector('#skills')).toHaveClass('cyberpunk-surface')
  })

  it('renders one card per category in use', () => {
    const groups = groupStack([
      { _id: 't1', name: 'React',  category: 'frontend' },
      { _id: 't2', name: 'Vitest', category: 'testing' },
    ])
    render(
      <LanguageProvider>
        <SkillsSection groups={groups} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
    expect(screen.queryByText('Backend')).not.toBeInTheDocument()
  })
})
