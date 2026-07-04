// src/test/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '#/i18n/LanguageContext'
import Header from '#/components/Header'

async function renderHeader() {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

function setScroll(
  innerHeight: number,
  scrollY: number,
  scrollHeight: number = innerHeight * 3,
) {
  Object.defineProperty(window, 'innerHeight', {
    value: innerHeight,
    configurable: true,
  })
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    configurable: true,
  })
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  })
}

describe('Header', () => {
  beforeEach(() => {
    // Default: scrolled past the hero (1.5x viewport height)
    // so old tests from Task 1 still pass
    setScroll(800, 1300)
  })
  it('links the brand mark to home', async () => {
    await renderHeader()
    const brand = screen.getByRole('link', { name: /thiago souza/i })
    expect(brand).toHaveAttribute('href', '/')
  })

  it('renders Home, About, and Contact nav links', async () => {
    await renderHeader()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/#contact',
    )
  })

  it('does not render the old TanStack scaffold links', async () => {
    await renderHeader()
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
    expect(screen.queryByText('Demos')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/follow tanstack on x/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/go to tanstack github/i),
    ).not.toBeInTheDocument()
  })

  it('does not render the AI assistant widget', async () => {
    await renderHeader()
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument()
  })

  it('links to LinkedIn and email', async () => {
    await renderHeader()
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/thiago-moraes-souza/',
    )
    const email = screen.getByRole('link', { name: 'Email' })
    expect(email).toHaveAttribute(
      'href',
      'mailto:thiagomoraes.contact@gmail.com',
    )
  })

  it('still renders the language toggle buttons', async () => {
    await renderHeader()
    expect(screen.getByRole('button', { name: 'en' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'es' })).toBeInTheDocument()
  })

  describe('scroll-gated visibility', () => {
    it('is not in the document before scrolling past 1.5x the viewport height', async () => {
      setScroll(800, 0)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('is not in the document just short of the threshold', async () => {
      setScroll(800, 1199)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('renders once scrolled at or past 1.5x the viewport height', async () => {
      setScroll(800, 1200)
      await renderHeader()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('appears in response to a scroll event after mounting below the threshold', async () => {
      setScroll(800, 0)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()

      setScroll(800, 1300)
      fireEvent.scroll(window)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('stays visible after scrolling back above the threshold once revealed', async () => {
      setScroll(800, 0)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()

      setScroll(800, 1300)
      fireEvent.scroll(window)
      expect(screen.getByRole('banner')).toBeInTheDocument()

      setScroll(800, 0)
      fireEvent.scroll(window)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('reveals immediately on a page shorter than the viewport (no scroll possible)', async () => {
      setScroll(800, 0, 600)
      await renderHeader()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('reveals at the bottom of a short page that cannot reach 1.5x the viewport', async () => {
      setScroll(800, 0, 1000)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()

      setScroll(800, 199, 1000)
      fireEvent.scroll(window)
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()

      setScroll(800, 200, 1000)
      fireEvent.scroll(window)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
})
