import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectCard from '../components/ProjectCard'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard } from './fixtures'
import type { Lang } from '../i18n/LanguageContext'
import type { CASE_STUDIES_QUERY_RESULT } from '../types/sanity.generated'

const mockProject = caseStudyCard()

function renderCard(project: CASE_STUDIES_QUERY_RESULT[number], lang: Lang, accentIndex: number) {
  return renderWithRouter(<ProjectCard project={project} lang={lang} accentIndex={accentIndex} />)
}

describe('ProjectCard', () => {
  it('renders the title for the active language', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
  })

  it('renders the summary for the active language', async () => {
    await renderCard(mockProject, 'pt', 0)
    expect(screen.getByText('Um site pessoal.')).toBeInTheDocument()
  })

  it('renders a tech chip for each stack entry', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders the headline result as "before → after · label"', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('40 → 95 · Lighthouse score')).toHaveAttribute('data-direction', 'up')
  })

  it('leaves the result line out when the case study has no results', async () => {
    await renderCard(caseStudyCard({ headlineResult: null }), 'en', 0)
    expect(screen.queryByText(/→/)).not.toBeInTheDocument()
  })

  it('applies glitch-flicker to the title', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toHaveClass('glitch-flicker')
  })

  it('renders the cover with its localized alt text', async () => {
    await renderCard(mockProject, 'en', 0)
    const image = screen.getByTestId('project-card-image')
    expect(image).toHaveAttribute('role', 'img')
    expect(image).toHaveAttribute('aria-label', 'Home page on a laptop')
    expect(image.style.backgroundImage).toContain('https://example.com/cover.jpg')
  })

  it('falls back to the cyberpunk-surface background when there is no cover', async () => {
    await renderCard(caseStudyCard({ cover: null }), 'en', 1)
    expect(screen.getByTestId('project-card-fallback')).toBeInTheDocument()
  })

  it('links to the project detail page for its slug', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/portfolio-site')
  })
})
