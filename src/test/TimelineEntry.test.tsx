// src/test/TimelineEntry.test.tsx
import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import TimelineEntry from '../components/TimelineEntry'
import { renderWithRouter } from './renderWithRouter'
import { localeString, localeText, metric } from './fixtures'
import { caseAnchor } from '../lib/inPage'
import type { Lang } from '../i18n/LanguageContext'
import type { ROLES_QUERY_RESULT } from '../types/sanity.generated'

type Role = ROLES_QUERY_RESULT[number]

const study = (n: number) => ({
  _id: `cs-${n}`,
  title: localeString({ en: `Study ${n}` }),
  slug: `study-${n}`,
  results: null,
})

const mockEntry: Role = {
  _id: '1',
  company: 'Acme Corp',
  companyUrl: null,
  title: localeString({ en: 'Senior Developer', pt: 'Desenvolvedor Sênior', es: 'Desarrollador Senior' }),
  summary: localeText({ en: 'Built great things.' }),
  startDate: '2022-01-01',
  endDate: null,
  stack: ['React', 'Node.js'],
  caseStudies: [
    {
      _id: 'cs-1',
      title: localeString({ en: 'Checkout rebuild' }),
      slug: 'checkout-rebuild',
      results: [metric(9, 'checkout drop-off', { before: 23, unit: '%', direction: 'down' })],
    },
    {
      _id: 'cs-2',
      title: localeString({ en: 'Design system' }),
      slug: 'design-system',
      results: null,
    },
  ],
}

const render = (
  entry: Role = mockEntry,
  { lang = 'en', last = false, compact = false }: { lang?: Lang; last?: boolean; compact?: boolean } = {},
) => renderWithRouter(<TimelineEntry entry={entry} lang={lang} last={last} compact={compact} />)

describe('TimelineEntry', () => {
  it('shows the role title as a heading and the company', async () => {
    await render()
    expect(screen.getByRole('heading', { level: 3, name: 'Senior Developer' })).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('shows the summary and tech stack tags', async () => {
    await render()
    expect(screen.getByText('Built great things.')).toBeInTheDocument()
    const stack = screen.getByRole('list', { name: 'Stack' })
    expect(within(stack).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['React', 'Node.js'])
  })

  it('shows at most six stack tags', async () => {
    await render({ ...mockEntry, stack: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] })
    expect(within(screen.getByRole('list', { name: 'Stack' })).getAllByRole('listitem')).toHaveLength(6)
  })

  it('links each case study of the role to its project page, in query order', async () => {
    await render()
    const links = within(screen.getByRole('list', { name: 'Case studies' })).getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Checkout rebuild', '/projects/checkout-rebuild'],
      ['Design system', '/projects/design-system'],
    ])
  })

  it('shows at most four case links', async () => {
    await render({ ...mockEntry, caseStudies: [1, 2, 3, 4, 5].map(study) })
    expect(within(screen.getByRole('list', { name: 'Case studies' })).getAllByRole('link')).toHaveLength(4)
    expect(screen.queryByRole('link', { name: 'Study 5' })).not.toBeInTheDocument()
  })

  it('lists the case links openly on a full entry, each with its headline result', async () => {
    await render()
    const list = screen.getByRole('list', { name: 'Case studies' })
    expect(list.closest('details')).toBeNull()
    const [first, second] = within(list).getAllByRole('listitem')
    expect(within(first).getByText('23% → 9% checkout drop-off')).toBeInTheDocument()
    // The result sits beside the link, so the link stays named by its title.
    expect(within(first).getByRole('link')).toHaveAccessibleName('Checkout rebuild')
    expect(second.textContent).toBe('Design system')
  })

  it('counts a compact entry\'s case studies instead of listing them', async () => {
    await render(mockEntry, { compact: true })
    expect(screen.getByText('2 case studies')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Case studies' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('counts a single case study in the singular', async () => {
    await render({ ...mockEntry, caseStudies: [study(1)] }, { compact: true })
    expect(screen.getByText('1 case study')).toBeInTheDocument()
  })

  it('counts every case study, past the four it would link', async () => {
    await render({ ...mockEntry, caseStudies: [1, 2, 3, 4, 5].map(study) }, { compact: true })
    expect(screen.getByText('5 case studies')).toBeInTheDocument()
  })

  it('carries the role id, so a Case card can mark it on the rail', async () => {
    const { container } = await render()
    expect(container.querySelector('article')).toHaveAttribute('data-role-entry', '1')
  })

  describe('a case link on the home page', () => {
    afterEach(() => {
      document.getElementById(caseAnchor('checkout-rebuild'))?.remove()
    })

    it('scrolls to the case study\'s card and marks it, instead of leaving the page', async () => {
      await render()
      const card = document.createElement('article')
      card.id = caseAnchor('checkout-rebuild')
      card.scrollIntoView = vi.fn()
      document.body.append(card)
      const link = screen.getByRole('link', { name: 'Checkout rebuild' })
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      fireEvent(link, click)
      expect(card.scrollIntoView).toHaveBeenCalled()
      expect(card).toHaveAttribute('data-pulse')
      expect(click.defaultPrevented).toBe(true)
    })

    it('follows the link when the card isn\'t on the page', async () => {
      await render()
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      // The router handles it as a navigation; goTo just declines.
      fireEvent(screen.getByRole('link', { name: 'Checkout rebuild' }), click)
      expect(document.querySelector('[data-pulse]')).toBeNull()
    })
  })

  it('shows summary and stack openly on a full entry', async () => {
    await render()
    expect(screen.getByText('Built great things.').closest('details')).toBeNull()
    expect(screen.getByRole('list', { name: 'Stack' }).closest('details')).toBeNull()
  })

  it('collapses a compact entry to its title line, with the rest behind "Details"', async () => {
    await render(mockEntry, { compact: true })
    expect(screen.getByRole('heading', { level: 3, name: 'Senior Developer' }).closest('details')).toBeNull()
    const details = screen.getByText('Built great things.').closest('details') as HTMLElement
    expect(details).not.toHaveAttribute('open')
    expect(within(details).getByText('Details').tagName).toBe('SUMMARY')
    expect(within(details).getByRole('list', { name: 'Stack' })).toBeInTheDocument()
  })

  it('has no "Details" on a compact entry with nothing to show', async () => {
    await render({ ...mockEntry, summary: null, stack: null, caseStudies: [] }, { compact: true })
    expect(screen.queryByText('Details')).not.toBeInTheDocument()
  })

  it('leaves the case study list out when the role has none', async () => {
    await render({ ...mockEntry, caseStudies: [] })
    expect(screen.queryByRole('list', { name: 'Case studies' })).not.toBeInTheDocument()
  })

  it('marks the ongoing role as current with a filled marker and "now"', async () => {
    const { container } = await render()
    expect(container.querySelector('article')).toHaveAttribute('data-current', 'true')
    expect(screen.getByTestId('marker')).toHaveClass('fill-mangrove')
    expect(screen.getByText('Jan 2022 – now')).toBeInTheDocument()
  })

  it('draws a past role with a hollow marker', async () => {
    const { container } = await render({ ...mockEntry, endDate: '2023-03-31' })
    expect(container.querySelector('article')).not.toHaveAttribute('data-current')
    expect(screen.getByTestId('marker')).toHaveClass('fill-ground')
    expect(screen.getByText('Jan 2022 – Mar 2023')).toBeInTheDocument()
  })

  it('continues the rail line except after the last role', async () => {
    await render()
    expect(screen.getByTestId('rail-line')).toBeInTheDocument()
  })

  it('stops the rail line at the last role', async () => {
    await render(mockEntry, { last: true })
    expect(screen.queryByTestId('rail-line')).not.toBeInTheDocument()
  })

  it('renders the role in the active language', async () => {
    await render(mockEntry, { lang: 'pt' })
    expect(screen.getByRole('heading', { name: 'Desenvolvedor Sênior' })).toBeInTheDocument()
  })

  it('renders the same month for a 1st-of-month date regardless of the runtime timezone', async () => {
    // Sanity's date-only strings must not shift a month back in negative UTC
    // offsets, or SSR and hydration render different text (React #418).
    const originalTz = process.env.TZ
    process.env.TZ = 'America/Sao_Paulo' // UTC-3
    try {
      await render({ ...mockEntry, startDate: '2021-08-01', endDate: '2021-10-01' })
      expect(screen.getByText('Aug – Oct 2021')).toBeInTheDocument()
    } finally {
      process.env.TZ = originalTz
    }
  })
})
