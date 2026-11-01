import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import StackSection from '../components/StackSection'
import { groupStack } from '../lib/stack'

const many = Array.from({ length: 11 }, (_, i) => ({
  _id: `f${i}`,
  name: `Tech ${String.fromCharCode(65 + i)}`,
  category: 'frontend' as const,
  caseStudies: 11 - i,
}))

const groups = groupStack([
  ...many,
  { _id: 'r', name: 'React', category: 'frontend', caseStudies: 20 },
  { _id: 'n', name: 'React Native', category: 'mobile', caseStudies: 1 },
  { _id: 'w', name: 'WebSockets', category: 'backend', caseStudies: 3 },
  { _id: 'p', name: 'PostgreSQL', category: 'data', caseStudies: 0 },
])

const renderSection = (lang: 'en' | 'pt' = 'en') =>
  render(
    <LanguageProvider>
      <StackSection groups={groups} caseStudyCount={13} lang={lang} />
    </LanguageProvider>,
  )

const row = (name: string) => screen.getByRole('heading', { level: 3, name }).closest('li') as HTMLElement

describe('StackSection', () => {
  it('is the #stack section with the case-study total in the lede', () => {
    renderSection()
    expect(screen.getByRole('region', { name: 'Stack' })).toHaveAttribute('id', 'stack')
    expect(screen.getByText('What I build with, and how many of the 13 case studies use it.')).toBeInTheDocument()
  })

  it('renders one row per category, backend and data merged', () => {
    renderSection()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Frontend', 'Mobile', 'Backend & data'])
  })

  it('shows up to five techs per row, most-used first, each with its count; core tags marked', () => {
    renderSection()
    const tags = within(row('Frontend')).getAllByRole('listitem')
    expect(tags.map((t) => t.textContent)).toEqual(['React20', 'Tech A11', 'Tech B10', 'Tech C9', 'Tech D8'])
    expect(tags[0].firstElementChild).toHaveAttribute('data-core', 'true')
    expect(tags[1].firstElementChild).not.toHaveAttribute('data-core')
  })

  it('always shows a core tech, however few case studies use it', () => {
    renderSection()
    expect(within(row('Mobile')).getAllByRole('listitem').map((t) => t.textContent)).toEqual(['React Native1'])
  })

  it('leaves out techs fewer than two case studies use, and has no "+N more"', () => {
    renderSection()
    expect(within(row('Backend & data')).getAllByRole('listitem').map((t) => t.textContent)).toEqual(['WebSockets3'])
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
