import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import { LocaleSwitch } from '../components/ui/LocaleSwitch'
import Footer from '../components/Footer'

function renderFooter(settings?: Parameters<typeof Footer>[0]['settings']) {
  return render(
    <LanguageProvider>
      <LocaleSwitch />
      <Footer settings={settings} />
    </LanguageProvider>,
  )
}

describe('Footer', () => {
  beforeEach(() => localStorage.clear())

  it('shows the copyright line with the current year and the brand name', () => {
    renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} Thiago Souza`)).toBeInTheDocument()
  })

  it('repeats the contact links, with the same fallbacks as the Contact section', () => {
    renderFooter(null)
    const list = screen.getByRole('list', { name: 'Contact' })
    const email = within(list).getByRole('link', { name: 'Email' })
    expect(email).toHaveAttribute('href', 'mailto:thiagomoraes.contact@gmail.com')
    expect(email).not.toHaveAttribute('target')
    const linkedin = within(list).getByRole('link', { name: /^LinkedIn ?\(opens in a new tab\)$/ })
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/thiago-moraes-souza/')
    expect(linkedin).toHaveAttribute('target', '_blank')
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(list).queryByRole('link', { name: /github/i })).toBeNull()
    expect(list.querySelectorAll('svg')).toHaveLength(2)
  })

  it('uses the links from siteSettings, GitHub included', () => {
    renderFooter({
      availability: null,
      email: 'hello@example.com',
      linkedin: 'https://www.linkedin.com/in/someone/',
      github: 'https://github.com/someone',
      seo: null,
    })
    const list = screen.getByRole('list', { name: 'Contact' })
    expect(within(list).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(within(list).getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/someone/')
    expect(within(list).getByRole('link', { name: /github/i })).toHaveAttribute('href', 'https://github.com/someone')
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
