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
    const dotsContainer = container.querySelector('.mt-6.flex.justify-center')
    expect(dotsContainer).toBeInTheDocument()
    expect(dotsContainer).toBeEmptyDOMElement()
  })
})
