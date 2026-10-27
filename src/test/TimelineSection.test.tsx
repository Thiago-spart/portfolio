// src/test/TimelineSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import TimelineSection from '../components/TimelineSection'
import { localeString } from './fixtures'
import type { ROLES_QUERY_RESULT } from '../types/sanity.generated'

// No case studies, so no <Link>s and no router needed.
const role = (id: string, company: string, startDate: string, endDate: string | null): ROLES_QUERY_RESULT[number] => ({
  _id: id,
  company,
  companyUrl: null,
  title: localeString({ en: `${company} role` }),
  summary: null,
  startDate,
  endDate,
  stack: ['React'],
  caseStudies: [],
})

const mockRoles: ROLES_QUERY_RESULT = [
  role('1', 'Acme Corp', '2022-01-01', null),
  role('2', 'Old Co', '2019-09-10', '2021-12-31'),
]

describe('TimelineSection', () => {
  it('is the #experience section, labelled by its heading', () => {
    render(<LanguageProvider><TimelineSection roles={mockRoles} lang="en" /></LanguageProvider>)
    expect(screen.getByRole('region', { name: 'Experience' })).toHaveAttribute('id', 'experience')
  })

  it('counts the roles and the first year in the lede', () => {
    render(<LanguageProvider><TimelineSection roles={mockRoles} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Two roles since 2019, newest first. Each links to the case studies it produced.')).toBeInTheDocument()
  })

  it('renders each role in order, visible without waiting for a scroll reveal', () => {
    render(<LanguageProvider><TimelineSection roles={mockRoles} lang="en" /></LanguageProvider>)
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['Acme Corp role', 'Old Co role'])
    expect(screen.getByText('Acme Corp').closest('.opacity-0')).toBeNull()
  })

  it('fills only the current role marker and ends the rail at the last role', () => {
    render(<LanguageProvider><TimelineSection roles={mockRoles} lang="en" /></LanguageProvider>)
    const [current, past] = screen.getAllByTestId('marker')
    expect(current).toHaveClass('fill-mangrove')
    expect(past).toHaveClass('fill-ground')
    expect(screen.getAllByTestId('rail-line')).toHaveLength(1)
  })
})
