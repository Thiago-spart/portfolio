import { screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectsSection from '../components/ProjectsSection'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, localeString } from './fixtures'
import type { CASE_STUDIES_QUERY_RESULT } from '../types/sanity.generated'

const mockProjects: CASE_STUDIES_QUERY_RESULT = [
  caseStudyCard(),
  caseStudyCard({ _id: 'cs-2', title: localeString({ en: 'Banking Tools' }), slug: 'banking-tools' }),
  caseStudyCard({
    _id: 'cs-3',
    title: localeString({ en: 'API Service' }),
    slug: 'api-service',
    tier: 'archive',
    stack: ['Node.js'],
  }),
  caseStudyCard({
    _id: 'cs-4',
    title: localeString({ en: 'Sparse Project' }),
    slug: 'sparse-project',
    tier: 'archive',
    summary: null,
    roleTitle: null,
    stack: null,
    results: null,
  }),
]

const renderSection = (projects: CASE_STUDIES_QUERY_RESULT) =>
  renderWithRouter(<ProjectsSection projects={projects} lang="en" />)

describe('ProjectsSection', () => {
  it('has the #projects anchor, labelled by its heading', async () => {
    const { container } = await renderSection(mockProjects)
    expect(container.querySelector('#projects')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Projects' })).toBeInTheDocument()
  })

  it('renders featured case studies as cards and the archive under "More work"', async () => {
    await renderSection(mockProjects)
    const [featured, archive] = screen.getAllByRole('list')
    expect(within(featured).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/projects/portfolio-site',
      '/projects/banking-tools',
    ])
    expect(screen.getByRole('heading', { name: 'More work' })).toBeInTheDocument()
    expect(screen.getByText('2 more case studies, newest first.')).toBeInTheDocument()
    expect(within(archive).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/projects/api-service',
      '/projects/sparse-project',
    ])
  })

  it('gives the accent to the first featured card only', async () => {
    const { container } = await renderSection(mockProjects)
    expect(container.querySelectorAll('[data-emphasis="accent"]')).toHaveLength(1)
    const firstCard = screen.getByRole('link', { name: 'Portfolio Site' }).closest('article')
    expect(firstCard?.querySelector('[data-emphasis="accent"]')).toBeInTheDocument()
  })

  it('leaves "More work" out without archive case studies', async () => {
    await renderSection(mockProjects.slice(0, 2))
    expect(screen.queryByRole('heading', { name: 'More work' })).not.toBeInTheDocument()
  })

  it('renders the empty state when there are no projects', async () => {
    await renderSection([])
    expect(screen.getByText('No case studies yet. Check back soon.')).toBeInTheDocument()
  })
})
