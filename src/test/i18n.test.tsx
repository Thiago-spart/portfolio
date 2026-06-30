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
})
