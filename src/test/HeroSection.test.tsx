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
  // Must be the first test in this file: HeroCanvas pulls in
  // three/@react-three/fiber/@react-three/drei/postprocessing (issue #11:
  // 1.14MB bundled into every route, including ones that never render it).
  // It must be behind React.lazy so those libraries split into their own
  // chunk instead of the shared route bundle — which means it cannot still
  // be present synchronously on the very first render. React.lazy() caches
  // resolution on its module-level lazy() instance once the dynamic
  // import() microtask flushes (which happens between any two tests), so
  // this can only be observed before anything else in the file renders it.
  it('does not render HeroCanvas synchronously (it is code-split behind React.lazy)', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(screen.queryByTestId('hero-canvas')).not.toBeInTheDocument()
  })

  it('renders HeroCanvas', async () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(await screen.findByTestId('hero-canvas')).toBeInTheDocument()
  })

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
})
