// src/test/Header.test.tsx
import { render, screen, within } from '@testing-library/react'
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
  it('is rendered from the first paint, without waiting for a scroll', async () => {
    await renderHeader()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('links the logo to home with an accessible name', async () => {
    await renderHeader()
    const brand = screen.getByRole('link', { name: 'Thiago Souza, home' })
    expect(brand).toHaveAttribute('href', '/')
  })

  it('shows the lockup and the phone mark', async () => {
    await renderHeader()
    const brand = screen.getByRole('link', { name: 'Thiago Souza, home' })
    expect(within(brand).getByText('Thiago Souza')).toBeInTheDocument()
    expect(brand.querySelectorAll('svg')).toHaveLength(2)
  })

  it('has the locale switch and the theme toggle', async () => {
    await renderHeader()
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
  })

  it('has no nav links or the old scaffold links', async () => {
    await renderHeader()
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByText(/tanstack/i)).toBeNull()
  })
})
