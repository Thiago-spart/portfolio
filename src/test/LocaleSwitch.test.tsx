import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import { LocaleSwitch } from '../components/ui/LocaleSwitch'

function renderSwitch() {
  return render(
    <LanguageProvider>
      <LocaleSwitch />
    </LanguageProvider>,
  )
}

describe('LocaleSwitch', () => {
  beforeEach(() => localStorage.clear())

  it('is a labelled group of EN, PT, ES in that order', () => {
    renderSwitch()
    const group = screen.getByRole('group', { name: 'Language' })
    const buttons = [...group.querySelectorAll('button')]
    expect(buttons.map((b) => b.textContent)).toEqual(['en', 'pt', 'es'])
  })

  it('titles each code in its own language, with a matching lang', () => {
    renderSwitch()
    const pt = screen.getByRole('button', { name: 'pt' })
    expect(pt).toHaveAttribute('lang', 'pt')
    expect(pt).toHaveAttribute('title', 'Português')
    expect(screen.getByRole('button', { name: 'es' })).toHaveAttribute('title', 'Español')
  })

  it('marks the active language with aria-pressed', () => {
    renderSwitch()
    expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'pt' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the language, remembers it and relabels itself', () => {
    renderSwitch()
    fireEvent.click(screen.getByRole('button', { name: 'es' }))
    expect(screen.getByRole('button', { name: 'es' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('lang')).toBe('es')
    expect(document.documentElement.lang).toBe('es')
    expect(screen.getByRole('group', { name: 'Idioma' })).toBeInTheDocument()
  })
})
