// src/test/ContactSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ContactSection from '../components/ContactSection'

describe('ContactSection', () => {
  it('has the #contact anchor', () => {
    const { container } = render(<LanguageProvider><ContactSection /></LanguageProvider>)
    expect(container.querySelector('#contact')).toBeInTheDocument()
  })

  it('renders LinkedIn link with correct href', () => {
    render(<LanguageProvider><ContactSection /></LanguageProvider>)
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/thiago-moraes-souza/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders email link with mailto', () => {
    render(<LanguageProvider><ContactSection /></LanguageProvider>)
    const link = screen.getByRole('link', { name: /email/i })
    expect(link).toHaveAttribute('href', 'mailto:thiagomoraes.contact@gmail.com')
  })

  it('has the cyberpunk-surface background class', () => {
    const { container } = render(<LanguageProvider><ContactSection /></LanguageProvider>)
    expect(container.querySelector('#contact')).toHaveClass('cyberpunk-surface')
  })

  it('has no GitHub card until siteSettings sets one', () => {
    render(<LanguageProvider><ContactSection settings={null} /></LanguageProvider>)
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
  })

  it('uses the links from siteSettings', () => {
    const settings = {
      email: 'hello@example.com',
      linkedin: 'https://www.linkedin.com/in/someone/',
      github: 'https://github.com/someone',
      seo: null,
    }
    render(<LanguageProvider><ContactSection settings={settings} /></LanguageProvider>)
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/someone/')
    const github = screen.getByRole('link', { name: /github/i })
    expect(github).toHaveAttribute('href', 'https://github.com/someone')
    expect(github).toHaveAttribute('target', '_blank')
    expect(screen.getAllByText('someone')).toHaveLength(2)
  })
})
