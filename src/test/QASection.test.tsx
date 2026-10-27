// src/test/QASection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import QASection from '../components/QASection'
import { localeBlock, localeString, paragraphs } from './fixtures'
import type { FAQ_QUERY_RESULT } from '../types/sanity.generated'

const mockItems: FAQ_QUERY_RESULT = [
  {
    _id: '1',
    question: localeString({ en: 'Are you available?', pt: 'Está disponível?', es: '¿Estás disponible?' }),
    answer:   localeBlock(paragraphs('Yes, I am.'), paragraphs('Sim, estou.'), paragraphs('Sí, lo estoy.')),
  },
  {
    _id: '2',
    question: localeString({ en: 'Do you work remotely?', pt: 'Você trabalha remotamente?', es: '¿Trabajas de forma remota?' }),
    answer:   localeBlock(paragraphs('Absolutely.', 'Across time zones, too.')),
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

  it('renders the answer as Portable Text, one paragraph per block', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Do you work remotely?'))
    expect(screen.getByText('Absolutely.').tagName).toBe('P')
    expect(screen.getByText('Across time zones, too.').tagName).toBe('P')
  })

  it('renders the answer in the active language', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="pt" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Está disponível?'))
    expect(screen.getByText('Sim, estou.')).toBeInTheDocument()
  })

  it('renders question in correct language', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="pt" /></LanguageProvider>)
    expect(screen.getByText('Está disponível?')).toBeInTheDocument()
  })
})
