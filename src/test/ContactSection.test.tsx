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
})
