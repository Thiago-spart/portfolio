import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import { LanguageProvider } from '../i18n/LanguageContext'

/** Renders `ui` at "/" inside a router that knows /projects/$slug, so <Link>s resolve. */
export async function renderWithRouter(ui: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <LanguageProvider>{ui}</LanguageProvider>,
  })
  const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects/$slug',
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([projectRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}
