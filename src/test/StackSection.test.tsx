import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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

const renderSection = ({ selected = null, matches = 0, onSelect = vi.fn() }: { selected?: string | null; matches?: number; onSelect?: (name: string) => void } = {}) =>
  render(
    <LanguageProvider>
      <StackSection groups={groups} lang="en" selected={selected} matches={matches} onSelect={onSelect} />
    </LanguageProvider>,
  )

const row = (name: string) => screen.getByRole('heading', { level: 3, name }).closest('li') as HTMLElement

describe('StackSection', () => {
  it('is the #stack section, its lede inviting a pick', () => {
    renderSection()
    expect(screen.getByRole('region', { name: 'Stack' })).toHaveAttribute('id', 'stack')
    expect(screen.getByText('What I build with. Pick a tool to see the work that uses it.')).toBeInTheDocument()
  })

  it('renders one row per category, backend and data merged', () => {
    renderSection()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Frontend', 'Mobile', 'Backend & data'])
  })

  it('shows up to five techs per row, most-used first, without counts; core tags marked', () => {
    renderSection()
    const tags = within(row('Frontend')).getAllByRole('button')
    expect(tags.map((t) => t.textContent)).toEqual(['React', 'Tech A', 'Tech B', 'Tech C', 'Tech D'])
    expect(tags[0].querySelector('[data-core]')).not.toBeNull()
    expect(tags[1].querySelector('[data-core]')).toBeNull()
  })

  it('always shows a core tech, however few case studies use it', () => {
    renderSection()
    expect(within(row('Mobile')).getAllByRole('button').map((t) => t.textContent)).toEqual(['React Native'])
  })

  it('leaves out techs fewer than two case studies use', () => {
    renderSection()
    expect(within(row('Backend & data')).getAllByRole('button').map((t) => t.textContent)).toEqual(['WebSockets'])
  })

  it('makes each tech a toggle button that selects it', () => {
    const onSelect = vi.fn()
    renderSection({ onSelect })
    const react = screen.getByRole('button', { name: 'React' })
    expect(react).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(react)
    expect(onSelect).toHaveBeenCalledWith('React')
  })

  it('presses the selected tech only', () => {
    renderSection({ selected: 'WebSockets', matches: 3 })
    expect(screen.getByRole('button', { name: 'WebSockets' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1)
  })

  it('announces how many case studies use the selected tech, politely', () => {
    renderSection({ selected: 'WebSockets', matches: 3 })
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('3 case studies use WebSockets')
  })

  it('says it in the singular for one', () => {
    renderSection({ selected: 'React Native', matches: 1 })
    expect(screen.getByRole('status')).toHaveTextContent('1 case study uses React Native')
  })

  it('keeps the live region empty with nothing selected', () => {
    renderSection()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
