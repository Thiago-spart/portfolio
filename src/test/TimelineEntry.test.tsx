// src/test/TimelineEntry.test.tsx
import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TimelineEntry from '../components/TimelineEntry'
import { renderWithRouter } from './renderWithRouter'
import { localeString, localeText, metric } from './fixtures'
import type { ROLES_QUERY_RESULT } from '../types/sanity.generated'

type Role = ROLES_QUERY_RESULT[number]

const mockEntry: Role = {
  _id: '1',
  company: 'Acme Corp',
  companyUrl: null,
  title: localeString({ en: 'Senior Developer', pt: 'Desenvolvedor Sênior', es: 'Desarrollador Senior' }),
  summary: localeText({ en: 'Built great things.' }),
  startDate: '2022-01-01',
  endDate: null,
  stack: ['React', 'Node.js'],
  caseStudies: [
    {
      _id: 'cs-1',
      title: localeString({ en: 'Checkout rebuild' }),
      slug: 'checkout-rebuild',
      results: [metric(9, 'checkout drop-off', { before: 23, unit: '%', direction: 'down' })],
    },
    {
      _id: 'cs-2',
      title: localeString({ en: 'Design system' }),
      slug: 'design-system',
      results: null,
    },
  ],
}

const render = (entry: Role = mockEntry) => renderWithRouter(<TimelineEntry entry={entry} lang="en" />)

describe('TimelineEntry', () => {
  it('shows company and role title', async () => {
    await render()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('shows the summary and tech stack tags', async () => {
    await render()
    expect(screen.getByText('Built great things.')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('links each case study of the role to its project page', async () => {
    await render()
    expect(screen.getByRole('link', { name: /checkout rebuild/i })).toHaveAttribute('href', '/projects/checkout-rebuild')
    expect(screen.getByRole('link', { name: /design system/i })).toHaveAttribute('href', '/projects/design-system')
  })

  it('does not show case study results by default', async () => {
    await render()
    expect(screen.queryByText('23% → 9%')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the case study results after click', async () => {
    await render()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('23% → 9%')).toBeInTheDocument()
    expect(screen.getByText('checkout drop-off')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses results on second click', async () => {
    await render()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('23% → 9%')).not.toBeInTheDocument()
  })

  it('has no toggle when no case study has results', async () => {
    await render({ ...mockEntry, caseStudies: [] })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows "Present" when endDate is null', async () => {
    await render()
    expect(screen.getByText(/present/i)).toBeInTheDocument()
  })

  it('renders the same month for a 1st-of-month date regardless of the runtime timezone', async () => {
    // Sanity's date-only "YYYY-MM-DD" strings get parsed by `new Date()` as
    // UTC midnight. Formatting that Date with toLocaleDateString() converts
    // it to the *runtime's local* timezone first — so a negative UTC offset
    // (e.g. server in UTC, visitor in Brazil/GMT-3) rolls a 1st-of-month date
    // back into the previous month. SSR (server, UTC) and hydration (visitor,
    // GMT-3) would then render different text for the same entry, which is
    // exactly what caused the reported React #418 hydration mismatch.
    const originalTz = process.env.TZ
    process.env.TZ = 'America/Sao_Paulo' // UTC-3
    try {
      await render({ ...mockEntry, startDate: '2021-08-01' })
      expect(screen.getByText(/Aug 2021/)).toBeInTheDocument()
    } finally {
      process.env.TZ = originalTz
    }
  })
})
