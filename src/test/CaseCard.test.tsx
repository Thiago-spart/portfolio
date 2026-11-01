import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CaseCard } from '../components/CaseCard'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, metric } from './fixtures'

describe('CaseCard', () => {
  it('is one link to the case study, named by its title', async () => {
    await renderWithRouter(<CaseCard caseStudy={caseStudyCard()} lang="en" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Portfolio Site' })).toHaveAttribute('href', '/projects/portfolio-site')
    expect(screen.getByRole('heading', { level: 3, name: 'Portfolio Site' })).toBeInTheDocument()
  })

  it('shows the role title, the years and the summary', async () => {
    await renderWithRouter(<CaseCard caseStudy={caseStudyCard()} lang="en" />)
    expect(screen.getByText('Lead Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('2023–2025')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAccessibleDescription('A personal site.')
  })

  it('shows a single year when the case study starts and ends in it', async () => {
    await renderWithRouter(
      <CaseCard caseStudy={caseStudyCard({ startDate: '2025-01-01', endDate: '2025-06-01' })} lang="en" />,
    )
    expect(screen.getByText('2025')).toBeInTheDocument()
  })

  it('renders the active language', async () => {
    await renderWithRouter(<CaseCard caseStudy={caseStudyCard()} lang="pt" />)
    expect(screen.getByRole('link', { name: 'Site Portfólio' })).toBeInTheDocument()
  })

  it('shows up to four tags, core for the main stack', async () => {
    const stack = ['Next.js', 'TypeScript', 'React', 'Vite', 'Storybook']
    const { container } = await renderWithRouter(<CaseCard caseStudy={caseStudyCard({ stack })} lang="en" />)
    expect(screen.getByText('Vite')).toBeInTheDocument()
    expect(screen.queryByText('Storybook')).not.toBeInTheDocument()
    const core = [...container.querySelectorAll('[data-core]')].map((el) => el.textContent)
    expect(core).toEqual(['TypeScript', 'React'])
  })

  it('shows up to two metrics, plain by default', async () => {
    const results = [metric(95, 'Lighthouse'), metric(80, 'Coverage', { unit: '%' }), metric(3, 'Apps')]
    const { container } = await renderWithRouter(<CaseCard caseStudy={caseStudyCard({ results })} lang="en" />)
    expect(screen.getByText('Lighthouse')).toBeInTheDocument()
    expect(screen.getByText('Coverage')).toBeInTheDocument()
    expect(screen.queryByText('Apps')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-emphasis="plain"]')).toHaveLength(2)
    expect(container.querySelector('[data-emphasis="accent"]')).not.toBeInTheDocument()
  })

  it('puts the accent on the first metric only when asked', async () => {
    const { container } = await renderWithRouter(<CaseCard caseStudy={caseStudyCard()} lang="en" accent />)
    const values = [...container.querySelectorAll('[data-emphasis]')]
    expect(values.map((el) => el.getAttribute('data-emphasis'))).toEqual(['accent', 'plain'])
    expect(values[0]).toHaveTextContent('95')
  })

  it('renders without role, summary, stack or results', async () => {
    await renderWithRouter(
      <CaseCard
        caseStudy={caseStudyCard({ roleTitle: null, summary: null, stack: null, results: null, startDate: null })}
        lang="en"
      />,
    )
    expect(screen.getByRole('link', { name: 'Portfolio Site' })).toBeInTheDocument()
  })

  it('puts the results right under the title, before the summary and tags', async () => {
    const { container } = await renderWithRouter(<CaseCard caseStudy={caseStudyCard()} lang="en" />)
    const order = [...container.querySelector('article')!.children].map((el) =>
      el.matches('h3') ? 'title' : el.classList.contains('case-tide') ? 'results' : el.id ? 'summary' : el.tagName,
    )
    expect(order.indexOf('results')).toBe(order.indexOf('title') + 1)
    expect(order.indexOf('summary')).toBeGreaterThan(order.indexOf('results'))
  })

  it('links to the live product in a new tab, above the card link', async () => {
    await renderWithRouter(<CaseCard caseStudy={caseStudyCard({ liveUrl: 'https://www.capitual.com/' })} lang="en" />)
    const live = screen.getByRole('link', { name: 'Live at capitual.com (opens in a new tab)' })
    expect(live).toHaveAttribute('href', 'https://www.capitual.com/')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveClass('relative', 'z-10')
  })

  it('names store listings by store', async () => {
    await renderWithRouter(
      <CaseCard caseStudy={caseStudyCard({ liveUrl: 'https://apps.apple.com/app/id1' })} lang="en" />,
    )
    expect(screen.getByRole('link', { name: /Live at App Store/ })).toBeInTheDocument()
  })
})
