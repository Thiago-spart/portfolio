import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import { LocaleSwitch } from '../components/ui/LocaleSwitch'
import Footer from '../components/Footer'

function renderFooter() {
  return render(
    <LanguageProvider>
      <LocaleSwitch />
      <Footer />
    </LanguageProvider>,
  )
}

describe('Footer', () => {
  beforeEach(() => localStorage.clear())

  it('shows the copyright line with the current year', () => {
    renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} Thiago Moraes de Souza`)).toBeInTheDocument()
  })

  it('links back to the top of the page', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#top')
  })

  it('translates "Back to top"', () => {
    renderFooter()
    fireEvent.click(screen.getByRole('button', { name: 'pt' }))
    expect(screen.getByRole('link', { name: 'Voltar ao topo' })).toBeInTheDocument()
  })
})
