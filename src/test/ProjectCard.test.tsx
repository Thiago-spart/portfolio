import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import ProjectCard from '../components/ProjectCard'
import type { Lang, SanityProject } from '../types/sanity'

const mockProject: SanityProject = {
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
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  startDate: '2024-01-15',
  endDate: null,
  featured: true,
}

async function renderCard(project: SanityProject, lang: Lang, accentIndex: number) {
  const rootRoute = createRootRoute({
    component: () => <ProjectCard project={project} lang={lang} accentIndex={accentIndex} />,
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

describe('ProjectCard', () => {
  it('renders the title for the active language', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
  })

  it('renders the short description for the active language', async () => {
    await renderCard(mockProject, 'pt', 0)
    expect(screen.getByText('Um site pessoal.')).toBeInTheDocument()
  })

  it('renders a tech chip for each techStack entry', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('applies glitch-flicker to the title', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toHaveClass('glitch-flicker')
  })

  it('renders the image layer when coverImageUrl is present', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByTestId('project-card-image')).toBeInTheDocument()
  })

  it('falls back to the cyberpunk-surface background when coverImageUrl is missing', async () => {
    const projectWithoutImage: SanityProject = { ...mockProject, coverImageUrl: undefined }
    await renderCard(projectWithoutImage, 'en', 1)
    expect(screen.getByTestId('project-card-fallback')).toBeInTheDocument()
  })

  it('links to the project detail page for its slug', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/portfolio-site')
  })
})
