// src/test/HeroSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import HeroSection from '../components/HeroSection'

vi.mock('../components/HeroCanvas', () => ({
  default: () => <div data-testid="hero-canvas" />,
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('HeroSection', () => {
  it('renders the available badge', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(screen.getByText('Available for work')).toBeInTheDocument()
  })

  it('renders CTA buttons with correct hrefs', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    const contactBtn = screen.getByRole('link', { name: /get in touch/i })
    expect(contactBtn).toHaveAttribute('href', '#contact')
    const projectsBtn = screen.getByRole('link', { name: /see my work/i })
    expect(projectsBtn).toHaveAttribute('href', '/projects')
  })

  it('renders HeroCanvas', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(screen.getByTestId('hero-canvas')).toBeInTheDocument()
  })
})
