import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
    coverImageUrl: 'https://example.com/cover.jpg',
    techStack: ['React'],
    category: 'web',
    status: 'completed',
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
    techStack: ['Node.js'],
    category: 'api',
    status: 'in-progress',
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
    techStack: [],
    category: 'web',
    status: 'completed',
    featured: false,
  },
]

describe('ProjectsSection', () => {
  it('has the #projects anchor with the cyberpunk-surface background class', () => {
    const { container } = render(
      <LanguageProvider>
        <ProjectsSection projects={mockProjects} lang="en" />
      </LanguageProvider>,
    )
    expect(container.querySelector('#projects')).toHaveClass('cyberpunk-surface')
  })

  it('renders a card for each project, including one with no tech chips', () => {
    render(
      <LanguageProvider>
        <ProjectsSection projects={mockProjects} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
    expect(screen.getByText('API Service')).toBeInTheDocument()
    expect(screen.getByText('Sparse Project')).toBeInTheDocument()
  })

  it('renders the empty state when there are no projects', () => {
    render(
      <LanguageProvider>
        <ProjectsSection projects={[]} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByText('No projects yet — check back soon.')).toBeInTheDocument()
  })

  it('renders the dot-indicator container without crashing when Embla reports zero snaps', () => {
    // jsdom performs no real layout, so Embla's scrollSnapList() never populates
    // here (it stays permanently empty, unlike a real browser). This exercises
    // the snapCount === 0 path — Array.from({ length: 0 }) — confirming the
    // component renders gracefully (no dots) instead of throwing.
    const { container } = render(
      <LanguageProvider>
        <ProjectsSection projects={mockProjects} lang="en" />
      </LanguageProvider>,
    )
    const dotsContainer = container.querySelector('.mt-6.flex.justify-center.gap-2')
    expect(dotsContainer).toBeInTheDocument()
    expect(dotsContainer).toBeEmptyDOMElement()
  })
})
