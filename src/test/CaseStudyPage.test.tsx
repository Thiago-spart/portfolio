import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import CaseStudyPage from '../components/CaseStudyPage'
import { READING_BAND } from '../lib/useReadingSection'
import { FakeObserver, fire } from './fakeObserver'
import { renderWithRouter } from './renderWithRouter'
import { caseStudyCard, caseStudyDetail, localeBlock, localeString, paragraphs } from './fixtures'

const next = caseStudyCard({ _id: 'cs-2', slug: 'banking-tools', title: localeString({ en: 'Banking Tools' }), tier: 'archive' })

type Detail = ReturnType<typeof caseStudyDetail>

const renderPage = (caseStudy: Detail = caseStudyDetail(), lang: 'en' | 'pt' = 'en', nextRow = next) =>
  renderWithRouter(<CaseStudyPage caseStudy={caseStudy} next={nextRow} lang={lang} />)

describe('CaseStudyPage', () => {
  it('renders the intro: back link, role · company, dates, title and summary', async () => {
    await renderPage()
    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/#projects')
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
})
