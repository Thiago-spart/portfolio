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
  {
    _id: '2',
    order: 2,
    question: { en: 'Do you work remotely?', pt: 'Você trabalha remotamente?', es: '¿Trabajas de forma remota?' },
    answer:   { en: 'Absolutely.',           pt: 'Com certeza.',                es: 'Por supuesto.' },
  },
]

describe('QASection', () => {
  it('renders section heading', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Ask me anything')).toBeInTheDocument()
  })

  it('renders question bubbles', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Are you available?')).toBeInTheDocument()
    expect(screen.getByText('Do you work remotely?')).toBeInTheDocument()
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
