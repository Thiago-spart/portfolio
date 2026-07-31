import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext'
import { useTranslation } from '../i18n/useTranslation'

function LangDisplay() {
  const { lang, setLang } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('pt')}>PT</button>
    </div>
  )
}

function TranslationDisplay() {
  const { t } = useTranslation()
  return <span data-testid="translation">{t('hero.cta.contact')}</span>
}

describe('i18n', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to "en"', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('switches language on setLang', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('PT'))
    expect(screen.getByTestId('lang').textContent).toBe('pt')
  })

  it('persists language to localStorage', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('PT'))
    expect(localStorage.getItem('lang')).toBe('pt')
  })

  it('returns correct string for active language', () => {
    render(<LanguageProvider><TranslationDisplay /></LanguageProvider>)
    expect(screen.getByTestId('translation').textContent).toBe('Get in touch')
  })

  it('renders "en" on first paint even with a stored non-English language, deferring detection to an effect', () => {
    // Simulates the SSR/hydration mismatch: server always renders 'en' (no
    // window), but a returning visitor has 'pt' saved from a previous visit.
    // If detection ran synchronously during the initial render, this first
    // render would already be 'pt', diverging from the server's HTML and
    // triggering React error #418 on hydration.
    localStorage.setItem('lang', 'pt')
    let firstRenderLang: string | undefined
    function Probe() {
      const { lang } = useLanguage()
      if (firstRenderLang === undefined) firstRenderLang = lang
      return <span data-testid="lang">{lang}</span>
    }
    render(<LanguageProvider><Probe /></LanguageProvider>)
    expect(firstRenderLang).toBe('en')
    expect(screen.getByTestId('lang').textContent).toBe('pt')
  })
})
