import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import CaseStudyPage from '../components/CaseStudyPage'
import { READING_BAND } from '../lib/useReadingSection'
import { FakeObserver, fire } from './fakeObserver'
import { fakeViewTransition } from './fakeViewTransition'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, caseStudyDetail, localeBlock, localeString, metric, paragraphs } from './fixtures'

const next = caseStudyCard({ _id: 'cs-2', slug: 'banking-tools', title: localeString({ en: 'Banking Tools' }), tier: 'archive' })

type Detail = ReturnType<typeof caseStudyDetail>

const renderPage = (caseStudy: Detail = caseStudyDetail(), lang: 'en' | 'pt' = 'en', nextRow = next) =>
  renderWithRouter(<CaseStudyPage caseStudy={caseStudy} next={nextRow} lang={lang} />)

describe('CaseStudyPage', () => {
  it('renders the intro: back link, role · company, dates, title and summary', async () => {
    await renderPage()
    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/#case-portfolio-site')
    expect(screen.getByText('Senior Developer · Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Jan 2024 – Jun 2024')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Portfolio Site' })).toBeInTheDocument()
    expect(screen.getByText('A personal site.')).toBeInTheDocument()
  })

  it('links the live site only when there is one', async () => {
    await renderPage()
    expect(screen.queryByRole('link', { name: 'Visit the live site' })).not.toBeInTheDocument()
  })

  it('opens the live site in a new tab', async () => {
    await renderPage(caseStudyDetail({ liveUrl: 'https://example.com' }))
    const live = screen.getByRole('link', { name: 'Visit the live site' })
    expect(live).toHaveAttribute('href', 'https://example.com')
    expect(live).toHaveAttribute('target', '_blank')
  })

  it('shows the results strip with the first metric in accent', async () => {
    const { container } = await renderPage()
    const strip = screen.getByRole('region', { name: 'Results' })
    expect(within(strip).getByText('Lighthouse score')).toBeInTheDocument()
    expect([...container.querySelectorAll('[data-emphasis]')].map((el) => el.getAttribute('data-emphasis'))).toEqual([
      'accent',
      'plain',
    ])
  })

  // #66: the covers are promo cards; they stay in Sanity but aren't shown
  // until real screenshots replace them.
  it('does not render the cover, even when Sanity has one', async () => {
    await renderPage()
    expect(screen.queryByRole('img', { name: 'Home page on a laptop' })).not.toBeInTheDocument()
  })

  it('shows the decision between the problem and the approach when there is one', async () => {
    await renderPage(caseStudyDetail({ decision: localeBlock(paragraphs('Kept WordPress as a headless CMS.')) }))
    const parts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(parts).toEqual(['Results', '1Problem', '2Decision', '3Approach', '4Stack', 'Next case study'])
    expect(screen.getByText('Kept WordPress as a headless CMS.')).toBeInTheDocument()
  })

  it('numbers the parts: problem, approach, stack', async () => {
    await renderPage()
    const parts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(parts).toEqual(['Results', '1Problem', '2Approach', '3Stack', 'Next case study'])
    expect(screen.getByText('The old site scored 40 on Lighthouse.').tagName).toBe('P')
    expect(screen.getByText('Then trimmed the bundle.')).toBeInTheDocument()
    const stack = screen.getByRole('region', { name: 'Stack' })
    expect(within(stack).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['React', 'TypeScript', 'Vitest'])
  })

  it('renumbers the parts when one is empty, and renders the active language', async () => {
    await renderPage(caseStudyDetail({ approach: null }), 'pt')
    expect(screen.getByText('O site antigo tinha nota 40 no Lighthouse.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stack' })).toHaveTextContent('2Stack')
  })

  it('adds gallery and video below the parts when present', async () => {
    const { container } = await renderPage(
      caseStudyDetail({
        videoUrl: 'https://cdn.sanity.io/files/p/d/demo.mp4',
        gallery: [{ _key: 'g1', url: 'https://cdn.sanity.io/images/p/d/shot.png', alt: localeString({ en: 'Checkout' }) }],
      }),
    )
    expect(screen.getByRole('heading', { name: 'Gallery' })).toHaveTextContent('4Gallery')
    expect(screen.getByRole('img', { name: 'Checkout' })).toBeInTheDocument()
    expect(container.querySelector('video')).toHaveAttribute('src', 'https://cdn.sanity.io/files/p/d/demo.mp4')
  })

  it('links the next case study as an archive row', async () => {
    await renderPage()
    const nav = screen.getByRole('navigation', { name: 'Next case study' })
    expect(within(nav).getByRole('link', { name: 'Banking Tools' })).toHaveAttribute('href', '/projects/banking-tools')
  })

  it('has no next link when it is the only case study', async () => {
    await renderPage(caseStudyDetail(), 'en', null as unknown as typeof next)
    expect(screen.queryByRole('navigation', { name: 'Next case study' })).not.toBeInTheDocument()
  })

  // #75: from 1024px, a sticky list of the numbered parts beside them.
  describe('contents', () => {
    let original: typeof IntersectionObserver

    beforeEach(() => {
      original = window.IntersectionObserver
      FakeObserver.instances = []
      window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
      window.IntersectionObserver = original
    })

    const contents = () => screen.getByRole('navigation', { name: 'Contents' })
    const part = (id: string) => document.getElementById(`part-${id}`) as HTMLElement

    it('lists the parts that render, numbered like their callouts, linking to each part', async () => {
      await renderPage()
      const links = within(contents()).getAllByRole('link')
      expect(links.map((a) => a.textContent)).toEqual(['1Problem', '2Approach', '3Stack'])
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['#part-problem', '#part-approach', '#part-stack'])
      for (const href of links.map((a) => a.getAttribute('href')!)) {
        expect(document.querySelector(href)?.tagName).toBe('SECTION')
      }
      // The parts keep their accessible names.
      expect(screen.getByRole('region', { name: 'Approach' })).toBe(part('approach'))
    })

    it('follows the parts when some are added or empty', async () => {
      await renderPage(
        caseStudyDetail({
          approach: null,
          decision: localeBlock(paragraphs('Kept WordPress as a headless CMS.')),
          videoUrl: 'https://cdn.sanity.io/files/p/d/demo.mp4',
        }),
      )
      expect(within(contents()).getAllByRole('link').map((a) => a.textContent)).toEqual([
        '1Problem',
        '2Decision',
        '3Stack',
        '4Gallery',
      ])
    })

    it('marks the part crossing the reading band as the current location', async () => {
      await renderPage()
      const band = FakeObserver.instances.find((o) => o.targets.has(part('problem')))
      expect(band?.options.rootMargin).toBe(READING_BAND)
      const link = (name: string) => within(contents()).getByRole('link', { name })
      expect(within(contents()).getAllByRole('link').some((a) => a.hasAttribute('aria-current'))).toBe(false)
      fire(part('approach'), true)
      expect(link('Approach')).toHaveAttribute('aria-current', 'location')
      expect(link('Problem')).not.toHaveAttribute('aria-current')
      fire(part('approach'), false)
      fire(part('stack'), true)
      expect(link('Stack')).toHaveAttribute('aria-current', 'location')
      expect(link('Approach')).not.toHaveAttribute('aria-current')
    })

    it('has no contents when there are no parts', async () => {
      await renderPage(caseStudyDetail({ problem: null, approach: null, stack: [] }))
      expect(screen.queryByRole('navigation', { name: 'Contents' })).not.toBeInTheDocument()
    })
  })

  // #77: the card's title and first result morph into these, and back.
  describe('view transition', () => {
    it('names the title and the first result like the case card does', async () => {
      const { container } = await renderPage()
      expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({ viewTransitionName: 'case-title-portfolio-site' })
      const named = [...container.querySelectorAll<HTMLElement>('[style*="view-transition-name"]')]
      expect(named.map((el) => el.style.viewTransitionName)).toEqual(['case-title-portfolio-site', 'case-result-portfolio-site'])
      expect(named[1]).toHaveTextContent(/^Lighthouse score/)
    })

    it('leaves the names off the next case study, so its home card stays put', async () => {
      await renderPage()
      const nav = screen.getByRole('navigation', { name: 'Next case study' })
      expect(nav.querySelector('[style*="view-transition-name"]')).toBeNull()
    })

    it('goes back to its card on the home page in a view transition', async () => {
      const vt = fakeViewTransition()
      try {
        await renderPage()
        const back = screen.getByRole('link', { name: 'All projects' })
        expect(back).toHaveAttribute('href', '/#case-portfolio-site')
        fireEvent.click(back)
        await waitFor(() => expect(vt.calls).toHaveLength(1))
      } finally {
        vt.restore()
      }
    })
  })

  // #67, #73: how each number was measured, linked both ways.
  describe('measurement', () => {
    const measured = () =>
      caseStudyDetail({
        results: [
          metric(95, 'Lighthouse score', {
            before: 40,
            key: 'lh',
            measurement: { method: localeString({ en: 'Lighthouse CLI, mobile, home page.' }), tool: 'Lighthouse CLI' },
          }),
          metric(40, 'Organic search', { unit: '%', qualifier: 'change', key: 'seo' }),
          metric(-96, 'Production bugs', {
            unit: '%',
            qualifier: 'change',
            key: 'bugs',
            measurement: {
              method: localeString({ en: 'Bugs per month in Jira.' }),
              tool: 'Jira',
              from: '2021-10-01',
              to: '2021-12-31',
              source: 'https://example.com/report',
            },
          }),
        ],
      })

    it('adds a Measurement part after Approach, one row per measured result', async () => {
      await renderPage(measured())
      const parts = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
      expect(parts).toEqual(['Results', '1Problem', '2Approach', '3Measurement', '4Stack', 'Next case study'])
      const part = screen.getByRole('region', { name: 'Measurement' })
      const rows = [...part.querySelectorAll('ol > li')] as HTMLElement[]
      expect(rows.map((row) => row.id)).toEqual(['result-lh', 'result-bugs'])
      expect(rows[0]).toHaveTextContent('40 → 95 · Lighthouse score')
      expect(rows[0]).toHaveTextContent('Lighthouse CLI, mobile, home page.')
      expect(rows[1]).toHaveTextContent('Jira · Oct 2021 – Dec 2021')
      expect(within(rows[1]).getByRole('link', { name: 'Source' })).toHaveAttribute('href', 'https://example.com/report')
      expect(within(rows[0]).queryByRole('link', { name: 'Source' })).toBeNull()
    })

    it('footnotes each measured number in the strip, numbered like its row, and links back', async () => {
      await renderPage(measured())
      const strip = screen.getByRole('region', { name: 'Results' })
      const notes = within(strip).getAllByRole('link')
      expect(notes.map((a) => [a.textContent, a.getAttribute('href'), a.getAttribute('aria-label')])).toEqual([
        ['1', '#result-lh', 'How it was measured: Lighthouse score'],
        ['2', '#result-bugs', 'How it was measured: Production bugs'],
      ])
      expect(document.getElementById('metric-seo')).not.toBeNull()
      const back = screen.getByRole('link', { name: 'Back to Production bugs' })
      expect(back).toHaveAttribute('href', '#metric-bugs')
    })

    it('has no Measurement part or footnotes when no result says how it was measured', async () => {
      await renderPage()
      expect(screen.queryByRole('region', { name: 'Measurement' })).toBeNull()
      expect(within(screen.getByRole('region', { name: 'Results' })).queryAllByRole('link')).toHaveLength(0)
    })

    it('gives results measured the same way one row and one footnote number', async () => {
      const lighthouse = { method: localeString({ en: 'Lighthouse, mobile, main page.' }), tool: 'Lighthouse' }
      await renderPage(
        caseStudyDetail({
          results: [
            metric(0.9, 'Largest Contentful Paint', { unit: 's', direction: 'down', key: 'lcp', measurement: lighthouse }),
            metric(98, 'Performance, desktop', { key: 'desk', measurement: { ...lighthouse, method: localeString({ en: 'Lighthouse, desktop, main page.' }) } }),
            metric(100, 'Accessibility', { key: 'a11y', measurement: { ...lighthouse } }),
          ],
        }),
      )
      const part = screen.getByRole('region', { name: 'Measurement' })
      const rows = [...part.querySelectorAll('ol > li')] as HTMLElement[]
      expect(rows.map((row) => row.id)).toEqual(['result-lcp', 'result-desk'])
      expect(within(rows[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
        '0.9s · Largest Contentful Paint',
        '100 · Accessibility',
      ])
      expect(rows[0]).toHaveTextContent('Lighthouse, mobile, main page.')
      const notes = within(screen.getByRole('region', { name: 'Results' })).getAllByRole('link')
      expect(notes.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
        ['1', '#result-lcp'],
        ['2', '#result-desk'],
        ['1', '#result-lcp'],
      ])
      expect(notes[2]).toHaveAccessibleName('How it was measured: Accessibility')
    })
  })
})
