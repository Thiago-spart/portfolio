import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import HowIWorkSection from '../components/HowIWorkSection'
import { localeBlock, localeString, paragraphs } from './fixtures'
import type { FAQ_QUERY_RESULT } from '../types/sanity.generated'

const mockItems: FAQ_QUERY_RESULT = [
  {
    _id: '1',
    question: localeString({ en: 'Are you available?', pt: 'Está disponível?', es: '¿Estás disponible?' }),
    answer: localeBlock(paragraphs('Yes, I am.'), paragraphs('Sim, estou.'), paragraphs('Sí, lo estoy.')),
  },
  {
    _id: '2',
    question: localeString({ en: 'Do you work remotely?', pt: 'Você trabalha remotamente?', es: '¿Trabajas de forma remota?' }),
    answer: localeBlock(paragraphs('Absolutely.', 'Across time zones, too.')),
  },
]

const renderSection = (lang: 'en' | 'pt' = 'en') =>
  render(<LanguageProvider><HowIWorkSection items={mockItems} lang={lang} /></LanguageProvider>)

const question = (name: RegExp) => screen.getByRole('button', { name })

describe('HowIWorkSection', () => {
  it('is the #how-i-work section, labelled by its heading, with no terminal chrome', () => {
    const { container } = renderSection()
    expect(screen.getByRole('region', { name: 'How I work' })).toHaveAttribute('id', 'how-i-work')
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}|ask_thiago/i)
  })

  it('numbers the questions and puts each in a heading button', () => {
    renderSection()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      '01Are you available?−',
      '02Do you work remotely?+',
    ])
  })

  it('keeps the number and toggle glyph out of the question names', () => {
    renderSection()
    expect(screen.getByRole('button', { name: 'Are you available?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do you work remotely?' })).toBeInTheDocument()
  })

  it('starts with the first question open and the others closed', () => {
    renderSection()
    expect(question(/are you available/i)).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, I am.')).toBeVisible()
    expect(question(/work remotely/i)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Absolutely.')).not.toBeVisible()
  })

  it('points each header at its answer region', () => {
    renderSection()
    const button = question(/are you available/i)
    const answer = document.getElementById(button.getAttribute('aria-controls') ?? '')
    expect(answer).toHaveAttribute('role', 'region')
    expect(answer).toHaveTextContent('Yes, I am.')
  })

  it('toggles aria-expanded and the answer on click', () => {
    renderSection()
    const second = question(/work remotely/i)
    fireEvent.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Absolutely.')).toBeVisible()
    fireEvent.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Absolutely.')).not.toBeVisible()
  })

  // Native <button type="button"> headers: in the tab order, and Enter and
  // Space activate them (a click event), with no key handlers to maintain.
  // jsdom doesn't synthesize that click from keys, so this checks the parts.
  it('works from the keyboard: native, focusable buttons that toggle on activation', () => {
    renderSection()
    const headers = screen.getAllByRole('button')
    for (const header of headers) {
      expect(header.tagName).toBe('BUTTON')
      expect(header).toHaveAttribute('type', 'button')
      expect(header).not.toHaveAttribute('tabindex')
      expect(header).toBeEnabled()
    }
    const first = headers[0]
    first.focus()
    expect(first).toHaveFocus()
    fireEvent.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(first).toHaveFocus()
  })

  it('renders the answer as Portable Text, one paragraph per block', () => {
    renderSection()
    fireEvent.click(question(/work remotely/i))
    expect(screen.getByText('Absolutely.').tagName).toBe('P')
    expect(screen.getByText('Across time zones, too.').tagName).toBe('P')
  })

  it('renders questions and answers in the active language', () => {
    renderSection('pt')
    expect(question(/está disponível/i)).toBeInTheDocument()
    expect(screen.getByText('Sim, estou.')).toBeVisible()
  })
})
