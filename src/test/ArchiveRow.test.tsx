import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArchiveRow } from '../components/ArchiveRow'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, localeString, metric } from './fixtures'

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
    // year, title, context, result slot (+ the arrow icon)
    const slots = container.querySelectorAll('a > span')
    expect(slots).toHaveLength(4)
    expect(slots[3]).toBeEmptyDOMElement()
  })
})
