import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ProjectDetails from '../components/ProjectDetails'
import type { SanityProject } from '../types/sanity'

const baseProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  longDescription: {
    en: 'A deep dive into the personal site build.',
    pt: 'Um mergulho profundo na construção do site pessoal.',
    es: 'Una inmersión profunda en la construcción del sitio personal.',
  },
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  startDate: '2024-01-15',
  endDate: '2024-06-01',
  featured: true,
}

function renderDetails(project: SanityProject) {
  return render(
    <LanguageProvider>
      <ProjectDetails project={project} lang="en" />
    </LanguageProvider>,
  )
}

describe('ProjectDetails', () => {
  it('renders the long description for the active language', () => {
    renderDetails(baseProject)
    expect(screen.getByText('A deep dive into the personal site build.')).toBeInTheDocument()
  })

  it('renders the localized status label', () => {
    renderDetails(baseProject)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders a formatted date range when endDate is set', () => {
    renderDetails(baseProject)
    expect(screen.getByText(/jan 2024/i)).toBeInTheDocument()
    expect(screen.getByText(/jun 2024/i)).toBeInTheDocument()
  })

  it('renders "Present" when endDate is null', () => {
    renderDetails({ ...baseProject, endDate: null })
    expect(screen.getByText(/present/i)).toBeInTheDocument()
  })

  it('renders a tech chip for each techStack entry', () => {
    renderDetails(baseProject)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('does not render live/source links when absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Live site')).not.toBeInTheDocument()
    expect(screen.queryByText('Source code')).not.toBeInTheDocument()
  })

  it('renders the live and source links when present', () => {
    renderDetails({
      ...baseProject,
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/repo',
    })
    expect(screen.getByRole('link', { name: /live site/i })).toHaveAttribute(
      'href',
      'https://example.com',
    )
    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      'https://github.com/example/repo',
    )
  })

  it('does not render a gallery section when galleryUrls is absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Gallery')).not.toBeInTheDocument()
  })

  it('renders gallery images when galleryUrls is present', () => {
    renderDetails({
      ...baseProject,
      galleryUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    })
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})
