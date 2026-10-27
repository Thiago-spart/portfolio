// src/test/TimelineSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import TimelineSection from '../components/TimelineSection'
import { localeString } from './fixtures'
import type { ROLES_QUERY_RESULT } from '../types/sanity.generated'

// No case studies, so no <Link>s and no router needed.
const mockRoles: ROLES_QUERY_RESULT = [
  {
    _id: '1',
    company: 'Acme Corp',
    companyUrl: null,
    title: localeString({ en: 'Senior Developer' }),
    summary: null,
    startDate: '2022-01-01',
    endDate: null,
    stack: ['React'],
    caseStudies: [],
  },
]

describe('TimelineSection', () => {
  it('renders each role, visible without waiting for a scroll reveal', () => {
    render(
      <LanguageProvider>
        <TimelineSection roles={mockRoles} lang="en" />
      </LanguageProvider>,
    )
    const company = screen.getByText('Acme Corp')
    expect(company).toBeInTheDocument()
    expect(company.closest('.opacity-0')).toBeNull()
  })
})
