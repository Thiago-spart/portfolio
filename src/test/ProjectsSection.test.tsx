import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectsSection from '../components/ProjectsSection'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, localeString } from './fixtures'
import type { CASE_STUDIES_QUERY_RESULT } from '../types/sanity.generated'

const mockProjects: CASE_STUDIES_QUERY_RESULT = [
  caseStudyCard(),
  caseStudyCard({
    _id: 'cs-2',
    title: localeString({ en: 'API Service' }),
    slug: 'api-service',
    tier: 'archive',
    stack: ['Node.js'],
    cover: null,
  }),
  caseStudyCard({
    _id: 'cs-3',
    title: localeString({ en: 'Sparse Project' }),
    slug: 'sparse-project',
    tier: 'archive',
    summary: null,
    cover: null,
    stack: null,
    headlineResult: null,
  }),
]

const renderSection = (projects: CASE_STUDIES_QUERY_RESULT) =>
  renderWithRouter(<ProjectsSection projects={projects} lang="en" />)

describe('ProjectsSection', () => {
  it('has the #projects anchor', async () => {
    const { container } = await renderSection(mockProjects)
    expect(container.querySelector('#projects')).toBeInTheDocument()
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
})
