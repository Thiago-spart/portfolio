import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArchiveRow } from '../components/ArchiveRow'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, localeString, metric } from './fixtures'
import { fakeViewTransition } from './fakeViewTransition'

const row = caseStudyCard({
  title: localeString({ en: 'Skydiet, web app and UI library' }),
  slug: 'skydiet',
  tier: 'archive',
  startDate: '2026-03-01',
  stack: ['React', 'Storybook', 'Vitest'],
  results: [metric(90, 'Test coverage', { unit: '%' })],
})

describe('ArchiveRow', () => {
  it('is one link to the case study, named by its title', async () => {
    await renderWithRouter(<ArchiveRow caseStudy={row} lang="en" />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    const link = screen.getByRole('link', { name: 'Skydiet, web app and UI library' })
    expect(link).toHaveAttribute('href', '/projects/skydiet')
  })

  it('shows the year, two techs and the headline result as a phrase', async () => {
    await renderWithRouter(<ArchiveRow caseStudy={row} lang="en" />)
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('React · Storybook')).toBeInTheDocument()
    expect(screen.getByText('90% test coverage')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAccessibleDescription('React · Storybook 90% test coverage')
  })

  it('keeps an empty result column when there is no result', async () => {
    const { container } = await renderWithRouter(<ArchiveRow caseStudy={{ ...row, results: null }} lang="en" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAccessibleDescription('React · Storybook')
    // year, title link, context, result slot (+ the arrow icon)
    const slots = container.querySelectorAll('div > span, div > a')
    expect(slots).toHaveLength(4)
    expect(container.querySelectorAll('div > span')[2]).toBeEmptyDOMElement()
  })
  it('carries the case study\'s in-page anchor, clear of the sheet index', async () => {
    const { container } = await renderWithRouter(<ArchiveRow caseStudy={caseStudyCard()} lang="en" />)
    const row = container.querySelector('#case-portfolio-site')
    expect(row).not.toBeNull()
    expect(row).toHaveClass('scroll-mt-16')
  })

  // #77: the title and headline result morph into the case page's.
  it('names its title and headline result for the view transition to its case page', async () => {
    await renderWithRouter(<ArchiveRow caseStudy={row} lang="en" />)
    expect(screen.getByRole('link')).toHaveStyle({ viewTransitionName: 'case-title-skydiet' })
    expect(screen.getByText('90% test coverage')).toHaveStyle({ viewTransitionName: 'case-result-skydiet' })
  })

  it('can leave the names off, for a row on a case page', async () => {
    const { container } = await renderWithRouter(<ArchiveRow caseStudy={row} lang="en" morph={false} />)
    expect(container.querySelector('[style*="view-transition-name"]')).toBeNull()
  })

  it('opens its case page in a view transition', async () => {
    const vt = fakeViewTransition()
    try {
      await renderWithRouter(<ArchiveRow caseStudy={row} lang="en" />)
      const link = screen.getByRole('link')
      fireEvent.click(link)
      await waitFor(() => expect(link).toHaveAttribute('data-status', 'active'))
      expect(vt.calls).toHaveLength(1)
    } finally {
      vt.restore()
    }
  })
})
