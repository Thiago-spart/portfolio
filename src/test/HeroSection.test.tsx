import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HERO_RESULTS_QUERY_RESULT } from '../types/sanity.generated'
import { LanguageProvider } from '../i18n/LanguageContext'
import HeroSection from '../components/HeroSection'
import { goToContact, HINT_KEY, ROOTS_KEY } from '../components/hero/heroShell'
import type { SceneOptions } from '../components/hero/mangroveScene'
import { localeString, metric } from './fixtures'
import { renderWithRouter } from './renderWithRouter'
import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import en from '../i18n/locales/en.json'
import pt from '../i18n/locales/pt.json'
import es from '../i18n/locales/es.json'

// The 3D scene is a dynamic import; here it is a fake that records how the
// shell drives it and lets tests fire its callbacks.
const scene = vi.hoisted(() => ({
  options: null as SceneOptions | null,
  replayProof: vi.fn(),
  reset: vi.fn(),
  setTheme: vi.fn(),
  setLabels: vi.fn(),
  destroy: vi.fn(),
}))
vi.mock('../components/hero/mangroveScene', () => ({
  createScene: vi.fn((options: SceneOptions) => {
    scene.options = options
    return scene
  }),
}))

const RESULTS: HERO_RESULTS_QUERY_RESULT = [
  {
    _key: 'r1',
    caseStudy: { title: localeString({ en: 'Redação Online' }), slug: 'redacao' },
    result: metric(95, 'Lighthouse performance score', { before: 40, key: 'm1' }),
  },
  {
    _key: 'r2',
    caseStudy: { title: localeString({ en: 'Capitual' }), slug: 'capitual' },
    result: metric(-96, 'Production bugs', { unit: '%', qualifier: 'change', direction: 'down', key: 'm2' }),
  },
  {
    _key: 'r3',
    caseStudy: { title: localeString({ en: 'Checkout' }), slug: 'checkout' },
    result: metric(9, 'Checkout drop-off', { before: 23, unit: '%', direction: 'down', key: 'm3' }),
  },
]

function renderHero(results: HERO_RESULTS_QUERY_RESULT = RESULTS) {
  return renderWithRouter(<HeroSection results={results} />)
}

// Server render inside a router, so the result labels' <Link>s resolve.
async function renderHeroHtml() {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <HeroSection results={RESULTS} />
      </LanguageProvider>
    ),
  })
  const projectRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projects/$slug', component: () => null })
  const router = createRouter({
    routeTree: rootRoute.addChildren([projectRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return renderToString(<RouterProvider router={router} />)
}

function mockMatchMedia(matching: string[]) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: matching.some((m) => query.includes(m)),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  )
}

const resultItems = () => within(screen.getByRole('list', { name: 'Results', hidden: true })).getAllByRole('listitem', { hidden: true })

beforeEach(() => {
  localStorage.clear()
  scene.options = null
  vi.clearAllMocks()
  mockMatchMedia([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

// The scene loads on the first pointer, touch, key, wheel or scroll.
function engage() {
  act(() => {
    window.dispatchEvent(new Event('pointermove'))
  })
}

describe('HeroSection', () => {
  it('server-renders the headline, the buttons and the poster', async () => {
    const html = await renderHeroHtml()
    expect(html).toMatch(/<h1[^>]*>Engineering you can measure\.<\/h1>/)
    expect(html).toContain('href="#contact"')
    expect(html).toContain('href="#projects"')
    expect(html).toContain('data-testid="hero-poster"')
    // No canvas on the server: the 3D scene only loads in the browser.
    expect(html).not.toContain('<canvas')
  })

  it('renders the headline as the one h1, with both actions', async () => {
    await renderHero()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Engineering you can measure.')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact')
    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#projects')
    expect(screen.getByTestId('hero-poster')).toHaveAttribute('aria-hidden', 'true')
  })

  it('formats the results lane from Sanity data, in order, with a real minus sign', async () => {
    await renderHero()
    const items = resultItems()
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Redação OnlineLighthouse performance score 40→ to 95')
    expect(items[1]).toHaveTextContent('−96%')
    expect(items[1].textContent).not.toContain('-')
    expect(items[2]).toHaveTextContent('23%→ to 9%')
    // The Lighthouse score carries its band glyph (● good); the others don't.
    expect(items[0].querySelector('circle.fill-score-good')).not.toBeNull()
    expect(items[1].querySelector('[class*="fill-score"]')).toBeNull()
    // Plain emphasis: no mango in the results.
    expect(items[0].innerHTML).not.toContain('mango')
  })

  it('names each result\'s product and links it to its case study', async () => {
    await renderHero()
    const items = resultItems()
    const link = within(items[1]).getByRole('link', { name: 'Capitual' })
    expect(link).toHaveAttribute('href', '/projects/capitual')
    expect(link).toHaveAccessibleDescription('Production bugs −96%')
    expect(within(items[0]).getByRole('link', { name: 'Redação Online' })).toHaveAttribute('href', '/projects/redacao')
  })

  it('shows the headline result once on phones: above the actions, not again in the lane', async () => {
    await renderHero()
    expect(resultItems()[0]).toHaveClass('max-hero:hidden')
    expect(resultItems()[1]).not.toHaveClass('max-hero:hidden')
    expect(within(screen.getByTestId('hero-headline-result')).getByRole('link', { name: 'Redação Online' })).toBeInTheDocument()
  })

  it('server-renders every result as text, each with its dimension line on the drawing', async () => {
    const html = await renderHeroHtml()
    expect(html).toContain('Lighthouse performance score')
    expect(html).toContain('Production bugs')
    expect(html).toContain('Checkout drop-off')
    // No hidden attribute (the first label hides by class below 900px only).
    expect(html).not.toMatch(/<li[^>]*\shidden[\s=>]/)
    // Three shoots with their dashed lines to the gauge, and three leaders.
    expect(html.match(/<mask /g)).toHaveLength(3)
    expect(html.match(/mangrove-leader/g)).toHaveLength(3)
  })

  it('shows the results before any interaction', async () => {
    await renderHero()
    resultItems().forEach((li) => expect(li).toBeVisible())
    expect(scene.options).toBeNull()
  })

  it('replays every result from the one keyboard button without hiding or toggling them', async () => {
    await renderHero()
    const leadersBefore = resultItems().map((li) => li.querySelector('.mangrove-leader'))
    const masksBefore = [...screen.getByTestId('hero-poster').querySelectorAll('mask')].map((m) => m.id)
    const button = screen.getByRole('button', { name: 'Replay the results' })
    expect(screen.getAllByRole('button', { name: /Replay/ })).toHaveLength(1)
    fireEvent.click(button)
    resultItems().forEach((li) => expect(li).toBeVisible())
    // Remounted, so every draw runs again.
    resultItems().forEach((li, i) => expect(li.querySelector('.mangrove-leader')).not.toBe(leadersBefore[i]))
    ;[...screen.getByTestId('hero-poster').querySelectorAll('mask')].forEach((m, i) => expect(m.id).not.toBe(masksBefore[i]))
    fireEvent.click(button)
    resultItems().forEach((li) => expect(li).toBeVisible())
  })

  it('replays through the scene once it has loaded', async () => {
    await renderHero()
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Replay the results' }))
    ;[0, 1, 2].forEach((i) => expect(scene.replayProof).toHaveBeenCalledWith(i))
    resultItems().forEach((li) => expect(li).toBeVisible())
  })

  it('puts the headline result under the subtitle on phones, above the actions', async () => {
    await renderHero()
    const line = screen.getByTestId('hero-headline-result')
    expect(line).toHaveTextContent('Lighthouse performance score')
    expect(line).toHaveTextContent('40→ to 95')
    expect(line).toHaveClass('hero:hidden')
    const subtitle = screen.getByText(/Senior mobile and web engineer/)
    const contact = screen.getByRole('link', { name: 'Get in touch' })
    expect(subtitle.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(line.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('still renders without results', async () => {
    await renderHero(null)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Results', hidden: true })).toBeNull()
  })

  it('shows the final grown state with all three results under reduced motion', async () => {
    mockMatchMedia(['prefers-reduced-motion'])
    await renderHero()
    resultItems().forEach((li) => expect(li).toBeVisible())
    expect(screen.getByTestId('hero-poster').querySelectorAll('.mangrove-draw')).toHaveLength(9)
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())
    expect(scene.options!.reducedMotion).toBe(true)
  })

  it('draws the dimension lines without animation under reduced motion (CSS)', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/hero.css'), 'utf8')
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.mangrove-draw,\s*\.mangrove-leader\s*\{\s*animation: none;/)
    // Without the animation the lines are simply drawn: the base state.
    expect(css).toMatch(/\.mangrove-draw \{\s*stroke-dasharray: 1;\s*animation:/)
  })

  it('keeps the poster and lists the results when WebGL is unavailable', async () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof original
    try {
      await renderHero()
      expect(screen.getByTestId('hero-poster')).toBeInTheDocument()
      resultItems().forEach((li) => expect(li).toBeVisible())
      expect(screen.queryByText(/Click or tap the water/)).toBeNull()
      expect(screen.queryByRole('button', { name: 'Reset garden' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Replay the results' })).toBeInTheDocument()
    } finally {
      HTMLCanvasElement.prototype.getContext = original
    }
  })

  it('keeps the poster until the visitor engages, then loads the 3D scene with the drawing box', async () => {
    await renderHero()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(scene.options).toBeNull()
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())
    const options = scene.options!
    // Marks stack in lane order: the first result highest, a clear gap between each.
    expect(options.results.map((r) => r.height)).toEqual([0.96, 0.801, expect.closeTo(0.61, 2)])
    expect(options.container).toContainElement(screen.getByTestId('hero-poster'))
    expect(options.lane()).toHaveLength(3)
    resultItems().forEach((li) => expect(li).toBeVisible())
  })

  it('hides the hint after the first root and remembers it; Reset garden brings it back', async () => {
    await renderHero()
    const hint = screen.getByText(/Click or tap the water/)
    expect(hint).not.toHaveClass('invisible')
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())

    act(() => scene.options!.onPlant())
    expect(hint).toHaveClass('invisible')
    expect(localStorage.getItem(HINT_KEY)).toBe('1')

    localStorage.setItem(ROOTS_KEY, '[[1,2]]')
    fireEvent.click(screen.getByRole('button', { name: 'Reset garden' }))
    expect(scene.reset).toHaveBeenCalled()
    expect(hint).not.toHaveClass('invisible')
    expect(localStorage.getItem(HINT_KEY)).toBeNull()
    expect(localStorage.getItem(ROOTS_KEY)).toBeNull()
  })

  it('keeps Reset garden as a quiet text button by the hint, out of the actions', async () => {
    await renderHero()
    const reset = screen.getByRole('button', { name: 'Reset garden' })
    expect(reset).toHaveTextContent(/^Reset$/)
    expect(reset.closest('div')).toContainElement(screen.getByText(/Click or tap the water/))
    const actions = screen.getByRole('link', { name: 'Get in touch' }).parentElement!
    expect(actions).not.toContainElement(reset)
  })

  it('words the hint for replays and for the keyboard, in all three languages', async () => {
    expect(en['hero.hint']).toBe('Click or tap the water to grow a root. Click a seed to replay its result.')
    for (const locale of [en, pt, es]) {
      expect(locale['hero.hint']).not.toMatch(/marked|marcada/)
      expect(locale['hero.hintKeys']).toMatch(/Tab/)
      expect(locale['hero.hintKeys']).toMatch(/Enter/)
      expect(locale['hero.hintKeys']).toContain(locale['hero.results.replay'])
      expect(locale['hero.reset']).toContain(locale['hero.resetShort'])
    }
    await renderHero()
    expect(screen.getByText(en['hero.hintKeys'])).toBeInTheDocument()
  })

  it('renders the hint in Portuguese', async () => {
    localStorage.setItem('lang', 'pt')
    await renderHero()
    expect(await screen.findByText(pt['hero.hint'])).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpar jardim' })).toHaveTextContent('Limpar')
  })

  it('keeps the hint hidden on a return visit', async () => {
    localStorage.setItem(HINT_KEY, '1')
    await renderHero()
    expect(screen.getByText(/Click or tap the water/)).toHaveClass('invisible')
  })

  it('cleans up the scene on unmount', async () => {
    const { unmount } = await renderHero()
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())
    unmount()
    expect(scene.destroy).toHaveBeenCalled()
  })
})

describe('goToContact (the mango)', () => {
  it('scrolls to #contact and moves focus to its heading', async () => {
    document.body.innerHTML = '<section id="contact"><h2 id="contact-heading" tabindex="-1">Let\'s talk</h2></section>'
    const section = document.getElementById('contact')!
    const heading = document.getElementById('contact-heading')!
    section.scrollIntoView = vi.fn()
    const focus = vi.spyOn(heading, 'focus')

    goToContact()

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(document.activeElement).toBe(heading)
  })

  it('jumps without smooth scrolling under reduced motion', () => {
    mockMatchMedia(['prefers-reduced-motion'])
    document.body.innerHTML = '<section id="contact"><h2 id="contact-heading" tabindex="-1">Let\'s talk</h2></section>'
    const section = document.getElementById('contact')!
    section.scrollIntoView = vi.fn()
    goToContact()
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })
  })

  it('is what the scene calls when the mango is clicked', async () => {
    await renderHero()
    engage()
    await waitFor(() => expect(scene.options).not.toBeNull())
    expect(scene.options!.onMango).toBe(goToContact)
  })
})
