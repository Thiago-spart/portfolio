import { render, screen, within, fireEvent } from '@testing-library/react'
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
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Frontend', 'Backend & data'])
  })

  it('shows eight tags most-used first, each with its count; core tags marked', () => {
    renderSection()
    const tags = within(row('Frontend')).getAllByRole('listitem')
    expect(tags).toHaveLength(8)
    expect(tags[0]).toHaveTextContent('React20')
    expect(tags[0].firstElementChild).toHaveAttribute('data-core', 'true')
    expect(tags[1]).toHaveTextContent('Tech A11')
    expect(tags[1].firstElementChild).not.toHaveAttribute('data-core')
  })

  it('hides the count when no case study uses the tech', () => {
    renderSection()
    const tags = within(row('Backend & data')).getAllByRole('listitem')
    expect(tags.map((t) => t.textContent)).toEqual(['WebSockets3', 'PostgreSQL'])
  })

  it('expands the rest in place with "+N more" and collapses with "Show less"', () => {
    renderSection()
    const frontend = row('Frontend')
    const toggle = within(frontend).getByRole('button', { name: '+4 more' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', within(frontend).getByRole('list').id)

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveTextContent('Show less')
    expect(within(frontend).getAllByRole('listitem')).toHaveLength(12)

    fireEvent.click(toggle)
    expect(within(frontend).getAllByRole('listitem')).toHaveLength(8)
  })

  it('has no toggle when everything fits', () => {
    renderSection()
    expect(within(row('Backend & data')).queryByRole('button')).not.toBeInTheDocument()
  })
})
