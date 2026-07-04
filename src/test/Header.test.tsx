// src/test/Header.test.tsx
import { render, screen } from '@testing-library/react'
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

describe('Header', () => {
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
})
