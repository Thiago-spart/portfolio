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

  it('renders a card for each project', () => {
    render(
      <LanguageProvider>
        <ProjectsSection projects={mockProjects} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
    expect(screen.getByText('API Service')).toBeInTheDocument()
  })

  it('renders the empty state when there are no projects', () => {
    render(
      <LanguageProvider>
        <ProjectsSection projects={[]} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByText('No projects yet — check back soon.')).toBeInTheDocument()
  })

  it('renders an accessible dot indicator per project', () => {
    render(
      <LanguageProvider>
        <ProjectsSection projects={mockProjects} lang="en" />
      </LanguageProvider>,
    )
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument()
  })
})
