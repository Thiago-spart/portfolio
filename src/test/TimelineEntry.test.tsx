// src/test/TimelineEntry.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import TimelineEntry from '../components/TimelineEntry'
import type { SanityExperience } from '../types/sanity'

const mockEntry: SanityExperience = {
  _id: '1',
  company: 'Acme Corp',
  role: { en: 'Senior Developer', pt: 'Desenvolvedor Sênior', es: 'Desarrollador Senior' },
  description: { en: 'Built great things.', pt: 'Construí coisas ótimas.', es: 'Construí cosas geniales.' },
  startDate: '2022-01-01',
  endDate: null,
  techStack: ['React', 'Node.js'],
  highlights: [{ value: '5', label: { en: 'engineers led', pt: 'engenheiros liderados', es: 'ingenieros liderados' } }],
}

describe('TimelineEntry', () => {
  it('shows company and role', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('shows tech stack tags', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('does not show highlights by default', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('shows highlights after click', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('engineers led')).toBeInTheDocument()
  })

  it('collapses highlights on second click', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('shows "Present" when endDate is null', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText(/present/i)).toBeInTheDocument()
  })

  it('renders the same month for a 1st-of-month date regardless of the runtime timezone', () => {
    // Sanity's date-only "YYYY-MM-DD" strings get parsed by `new Date()` as
    // UTC midnight. Formatting that Date with toLocaleDateString() converts
    // it to the *runtime's local* timezone first — so a negative UTC offset
    // (e.g. server in UTC, visitor in Brazil/GMT-3) rolls a 1st-of-month date
    // back into the previous month. SSR (server, UTC) and hydration (visitor,
    // GMT-3) would then render different text for the same entry, which is
    // exactly what caused the reported React #418 hydration mismatch.
    const entryOnMonthBoundary: SanityExperience = {
      ...mockEntry,
      startDate: '2021-08-01',
    }
    const originalTz = process.env.TZ
    process.env.TZ = 'America/Sao_Paulo' // UTC-3
    try {
      render(<LanguageProvider><TimelineEntry entry={entryOnMonthBoundary} lang="en" /></LanguageProvider>)
      expect(screen.getByText(/Aug 2021/)).toBeInTheDocument()
    } finally {
      process.env.TZ = originalTz
    }
  })
})
