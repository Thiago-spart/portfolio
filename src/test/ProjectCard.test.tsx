import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectCard from '../components/ProjectCard'
import type { SanityProject } from '../types/sanity'

const mockProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  coverImageUrl: 'https://example.com/cover.jpg',
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  featured: true,
}

describe('ProjectCard', () => {
  it('renders the title for the active language', () => {
    render(<ProjectCard project={mockProject} lang="en" accentIndex={0} />)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
  })

  it('renders the short description for the active language', () => {
    render(<ProjectCard project={mockProject} lang="pt" accentIndex={0} />)
    expect(screen.getByText('Um site pessoal.')).toBeInTheDocument()
  })

  it('renders a tech chip for each techStack entry', () => {
    render(<ProjectCard project={mockProject} lang="en" accentIndex={0} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('applies glitch-flicker to the title', () => {
    render(<ProjectCard project={mockProject} lang="en" accentIndex={0} />)
    expect(screen.getByText('Portfolio Site')).toHaveClass('glitch-flicker')
  })

  it('renders the image layer when coverImageUrl is present', () => {
    render(<ProjectCard project={mockProject} lang="en" accentIndex={0} />)
    expect(screen.getByTestId('project-card-image')).toBeInTheDocument()
  })

  it('falls back to the cyberpunk-surface background when coverImageUrl is missing', () => {
    const projectWithoutImage: SanityProject = { ...mockProject, coverImageUrl: undefined }
    render(<ProjectCard project={projectWithoutImage} lang="en" accentIndex={1} />)
    expect(screen.getByTestId('project-card-fallback')).toBeInTheDocument()
  })
})
