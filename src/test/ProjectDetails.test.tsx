import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ProjectDetails from '../components/ProjectDetails'
import { localeBlock, localeString, metric, paragraphs } from './fixtures'
import type { CASE_STUDY_DETAIL_QUERY_RESULT } from '../types/sanity.generated'

type CaseStudy = NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>

const baseProject: CaseStudy = {
  _id: 'cs-1',
  title: localeString({ en: 'Portfolio Site' }),
  slug: 'portfolio-site',
  summary: localeString({ en: 'A personal site.' }),
  problem: localeBlock(
    paragraphs('The old site scored 40 on Lighthouse.'),
    paragraphs('O site antigo tinha nota 40 no Lighthouse.'),
  ),
  approach: localeBlock(paragraphs('Rebuilt it with SSR.', 'Then trimmed the bundle.')),
  results: null,
  stack: ['React', 'TypeScript'],
  role: { company: 'Acme Corp', companyUrl: null, title: localeString({ en: 'Senior Developer' }) },
  cover: null,
  gallery: null,
  videoUrl: null,
  liveUrl: null,
  githubUrl: null,
  startDate: '2024-01-15',
  endDate: '2024-06-01',
}

function renderDetails(project: CaseStudy, lang: 'en' | 'pt' = 'en') {
  return render(
    <LanguageProvider>
      <ProjectDetails project={project} lang={lang} />
    </LanguageProvider>,
  )
}

describe('ProjectDetails', () => {
  it('renders problem and approach as Portable Text paragraphs', () => {
    renderDetails(baseProject)
    const problem = screen.getByText('The old site scored 40 on Lighthouse.')
    expect(problem.tagName).toBe('P')
    expect(screen.getByText('Rebuilt it with SSR.').tagName).toBe('P')
    expect(screen.getByText('Then trimmed the bundle.')).not.toBe(screen.getByText('Rebuilt it with SSR.'))
  })

  it('renders the rich text for the active language', () => {
    renderDetails(baseProject, 'pt')
    expect(screen.getByText('O site antigo tinha nota 40 no Lighthouse.')).toBeInTheDocument()
    expect(screen.queryByText('The old site scored 40 on Lighthouse.')).not.toBeInTheDocument()
  })

  it('renders without problem/approach', () => {
    renderDetails({ ...baseProject, problem: null, approach: null })
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders the role title and company', () => {
    renderDetails(baseProject)
    expect(screen.getByText('Senior Developer · Acme Corp')).toBeInTheDocument()
  })

  it('renders without a role (a case study outside the timeline)', () => {
    renderDetails({ ...baseProject, role: null })
    expect(screen.queryByText(/Acme Corp/)).not.toBeInTheDocument()
    expect(screen.getByText(/jan 2024/i)).toBeInTheDocument()
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

  it('leaves the date out when the case study has no start date', () => {
    renderDetails({ ...baseProject, startDate: null, role: null })
    expect(screen.queryByText(/2024/)).not.toBeInTheDocument()
  })

  it('renders a tech chip for each stack entry', () => {
    renderDetails(baseProject)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('does not render a results section without results', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument()
    renderDetails({ ...baseProject, results: [] })
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument()
  })

  it('renders each result as "before → after" with its label and direction', () => {
    renderDetails({
      ...baseProject,
      results: [
        metric(95, 'Lighthouse score', { before: 40 }),
        metric(9, 'Checkout drop-off', { before: 23, unit: '%', direction: 'down' }),
        metric(-96, 'Production bugs', { unit: '%', direction: 'down' }),
      ],
    })
    expect(screen.getByText('Highlights')).toBeInTheDocument()
    expect(screen.getByText('40 → 95')).toBeInTheDocument()
    expect(screen.getByText('Lighthouse score')).toBeInTheDocument()
    expect(screen.getByText('23% → 9%').parentElement).toHaveAttribute('data-direction', 'down')
    expect(screen.getByText('\u221296%')).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: /live site/i })).toHaveAttribute('href', 'https://example.com')
    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      'https://github.com/example/repo',
    )
  })

  it('does not render a gallery section without images', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Gallery')).not.toBeInTheDocument()
  })

  it('renders gallery images with their localized alt text', () => {
    renderDetails({
      ...baseProject,
      gallery: [
        { _key: 'g1', url: 'https://example.com/1.jpg', alt: localeString({ en: 'Dashboard, dark theme' }) },
        { _key: 'g2', url: 'https://example.com/2.jpg', alt: localeString({ en: 'Checkout on mobile' }) },
        { _key: 'g3', url: null, alt: localeString({ en: 'Missing asset' }) },
      ],
    })
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByAltText('Dashboard, dark theme')).toHaveAttribute('src', 'https://example.com/1.jpg')
  })
})
