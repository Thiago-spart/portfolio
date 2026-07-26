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
})
