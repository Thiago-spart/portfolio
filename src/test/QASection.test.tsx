// src/test/QASection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import QASection from '../components/QASection'
import type { SanityQA } from '../types/sanity'

const mockItems: SanityQA[] = [
  {
    _id: '1',
    order: 1,
    question: { en: 'Are you available?', pt: 'Está disponível?', es: '¿Estás disponible?' },
    answer:   { en: 'Yes, I am.',         pt: 'Sim, estou.',       es: 'Sí, lo estoy.' },
  },
]

describe('QASection', () => {
  it('renders question bubbles', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Are you available?')).toBeInTheDocument()
  })

  it('does not show answer by default', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.queryByText('Yes, I am.')).not.toBeInTheDocument()
  })

  it('shows answer after clicking question', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Are you available?'))
    expect(screen.getByText('Yes, I am.')).toBeInTheDocument()
  })

  it('hides answer after second click', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Are you available?'))
    fireEvent.click(screen.getByText('Are you available?'))
    expect(screen.queryByText('Yes, I am.')).not.toBeInTheDocument()
  })

  it('renders question in correct language', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="pt" /></LanguageProvider>)
    expect(screen.getByText('Está disponível?')).toBeInTheDocument()
  })
})
