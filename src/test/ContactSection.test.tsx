// src/test/ContactSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ContactSection from '../components/ContactSection'

const renderSection = (settings?: Parameters<typeof ContactSection>[0]['settings']) =>
  render(<LanguageProvider><ContactSection settings={settings} /></LanguageProvider>)

describe('ContactSection', () => {
  it('keeps the anchor contract with the hero: #contact labelled by a focusable #contact-heading', () => {
    renderSection()
    const section = screen.getByRole('region', { name: "Let's talk" })
    expect(section).toHaveAttribute('id', 'contact')
    expect(section).toHaveAttribute('aria-labelledby', 'contact-heading')
    const heading = screen.getByRole('heading', { level: 2, name: "Let's talk" })
    expect(heading).toHaveAttribute('id', 'contact-heading')
    expect(heading).toHaveAttribute('tabindex', '-1')
    heading.focus()
    expect(heading).toHaveFocus()
  })

  it('makes Email the primary action, a mailto link', () => {
    renderSection()
    const link = screen.getByRole('link', { name: /email/i })
    expect(link).toHaveAttribute('href', 'mailto:thiagomoraes.contact@gmail.com')
    expect(link).toHaveClass('bg-mangrove')
    expect(link).not.toHaveAttribute('target')
  })

  it('renders LinkedIn as a secondary link that opens in a new tab', () => {
    renderSection()
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/thiago-moraes-souza/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName(/^LinkedIn ?\(opens in a new tab\)$/)
  })

  it('shows the email address in text', () => {
    renderSection()
    expect(screen.getByText('thiagomoraes.contact@gmail.com')).toBeInTheDocument()
  })

  it('has no GitHub link until siteSettings sets one', () => {
    renderSection(null)
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
  })

  it('uses the links from siteSettings', () => {
    renderSection({
      availability: null,
      email: 'hello@example.com',
      linkedin: 'https://www.linkedin.com/in/someone/',
      github: 'https://github.com/someone',
      seo: null,
    })
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/someone/')
    const github = screen.getByRole('link', { name: /github/i })
    expect(github).toHaveAttribute('href', 'https://github.com/someone')
    expect(github).toHaveAttribute('target', '_blank')
    expect(screen.getByText('hello@example.com')).toBeInTheDocument()
  })

  it('translates the heading and labels', () => {
    localStorage.setItem('lang', 'pt')
    try {
      renderSection()
      expect(screen.getByRole('heading', { name: 'Vamos conversar' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /e-mail/i })).toBeInTheDocument()
    } finally {
      localStorage.clear()
    }
  })

  it('shows the availability line from siteSettings, in the visitor\'s language', () => {
    const availability = {
      _type: 'localeString' as const,
      en: 'Taking on contract work. Open to senior and lead roles.',
      pt: 'Disponível para projetos. Aberto a vagas sênior e de liderança.',
      es: 'Disponible para proyectos. Abierto a roles sénior y de liderazgo.',
    }
    const settings = { availability, email: null, linkedin: null, github: null, seo: null }
    const { unmount } = renderSection(settings)
    expect(screen.getByTestId('availability')).toHaveTextContent(availability.en)
    unmount()
    localStorage.setItem('lang', 'pt')
    try {
      renderSection(settings)
      expect(screen.getByTestId('availability')).toHaveTextContent(availability.pt)
    } finally {
      localStorage.clear()
    }
  })

  it('leaves the availability line out until siteSettings sets it', () => {
    renderSection(null)
    expect(screen.queryByTestId('availability')).toBeNull()
    expect(screen.queryByText(/open to senior/i)).toBeNull()
  })
})
