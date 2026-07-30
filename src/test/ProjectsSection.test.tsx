import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import { LanguageProvider } from '../i18n/LanguageContext'
import ProjectsSection from '../components/ProjectsSection'
import type { SanityProject } from '../types/sanity'

const mockProjects: SanityProject[] = [
  {
    _id: 'proj-1',
    title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
    slug: { current: 'portfolio-site' },
    shortDescription: {
      en: 'A personal site.',
      pt: 'Um site pessoal.',
      es: 'Un sitio personal.',
    },
    longDescription: {
      en: 'A deep dive into building the personal site.',
      pt: 'Um mergulho profundo na construção do site pessoal.',
      es: 'Una inmersión profunda en la construcción del sitio personal.',
    },
    coverImageUrl: 'https://example.com/cover.jpg',
    techStack: ['React'],
    category: 'web',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: null,
    featured: true,
  },
  {
    _id: 'proj-2',
    title: { en: 'API Service', pt: 'Serviço API', es: 'Servicio API' },
    slug: { current: 'api-service' },
    shortDescription: {
      en: 'A backend service.',
      pt: 'Um serviço de backend.',
      es: 'Un servicio backend.',
    },
    longDescription: {
      en: 'Notes on building the backend service.',
      pt: 'Notas sobre a construção do serviço de backend.',
      es: 'Notas sobre la construcción del servicio backend.',
    },
    techStack: ['Node.js'],
    category: 'api',
    status: 'in-progress',
    startDate: '2024-03-01',
    endDate: null,
    featured: false,
  },
  {
    _id: 'proj-3',
    title: { en: 'Sparse Project', pt: 'Projeto Simples', es: 'Proyecto Simple' },
    slug: { current: 'sparse-project' },
    shortDescription: {
      en: 'A project with no tech chips.',
      pt: 'Um projeto sem chips de tecnologia.',
      es: 'Un proyecto sin chips de tecnología.',
    },
    longDescription: {
      en: 'A minimal project used to exercise the empty-state paths.',
      pt: 'Um projeto mínimo usado para testar os estados vazios.',
      es: 'Un proyecto mínimo usado para probar los estados vacíos.',
    },
    techStack: [],
    category: 'web',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2023-12-01',
    featured: false,
  },
]

async function renderSection(projects: SanityProject[]) {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <ProjectsSection projects={projects} lang="en" />
      </LanguageProvider>
    ),
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

describe('ProjectsSection', () => {
  it('has the #projects anchor with the cyberpunk-surface background class', async () => {
    const { container } = await renderSection(mockProjects)
    expect(container.querySelector('#projects')).toHaveClass('cyberpunk-surface')
  })

  it('renders a card for each project, including one with no tech chips', async () => {
    await renderSection(mockProjects)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
    expect(screen.getByText('API Service')).toBeInTheDocument()
    expect(screen.getByText('Sparse Project')).toBeInTheDocument()
  })

  it('renders the empty state when there are no projects', async () => {
    await renderSection([])
    expect(screen.getByText('No projects yet — check back soon.')).toBeInTheDocument()
  })

  it('renders the dot-indicator container without crashing when Embla reports zero snaps', async () => {
    // jsdom performs no real layout, so Embla's scrollSnapList() never populates
    // here (it stays permanently empty, unlike a real browser). This exercises
    // the snapCount === 0 path — Array.from({ length: 0 }) — confirming the
    // component renders gracefully (no dots) instead of throwing.
    const { container } = await renderSection(mockProjects)
    const dotsContainer = container.querySelector('.mt-6.flex.justify-center.gap-2')
    expect(dotsContainer).toBeInTheDocument()
    expect(dotsContainer).toBeEmptyDOMElement()
  })
})
