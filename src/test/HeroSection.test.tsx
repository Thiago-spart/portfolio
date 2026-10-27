import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HERO_RESULTS_QUERY_RESULT } from '../types/sanity.generated'
import { LanguageProvider } from '../i18n/LanguageContext'
import HeroSection from '../components/HeroSection'
import { goToContact, HINT_KEY, ROOTS_KEY } from '../components/hero/heroShell'
import type { SceneOptions } from '../components/hero/mangroveScene'
import { localeString, metric } from './fixtures'

// The 3D scene is a dynamic import; here it is a fake that records how the
// shell drives it and lets tests fire its callbacks.
const scene = vi.hoisted(() => ({
  options: null as SceneOptions | null,
  activateProof: vi.fn(),
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
  return render(
    <LanguageProvider>
      <HeroSection results={results} />
    </LanguageProvider>,
  )
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

describe('HeroSection', () => {
  it('server-renders the headline, the buttons and the poster', () => {
    const html = renderToString(
      <LanguageProvider>
        <HeroSection results={RESULTS} />
      </LanguageProvider>,
    )
    expect(html).toMatch(/<h1[^>]*>Engineering you can measure\.<\/h1>/)
    expect(html).toContain('href="#contact"')
    expect(html).toContain('href="#projects"')
    expect(html).toContain('data-testid="hero-poster"')
    // No canvas on the server: the 3D scene only loads in the browser.
    expect(html).not.toContain('<canvas')
  })

  it('renders the headline as the one h1, with both actions', () => {
    renderHero()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Engineering you can measure.')
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact')
    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#projects')
    expect(screen.getByTestId('hero-poster')).toHaveAttribute('aria-hidden', 'true')
  })

  it('formats the results lane from Sanity data, in order, with a real minus sign', () => {
    renderHero()
    const items = resultItems()
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Lighthouse performance score40→ to 95')
    expect(items[1]).toHaveTextContent('−96%')
    expect(items[1].textContent).not.toContain('-')
    expect(items[2]).toHaveTextContent('23%→ to 9%')
    // The Lighthouse score carries its band glyph (● good); the others don't.
    expect(items[0].querySelector('circle.fill-score-good')).not.toBeNull()
    expect(items[1].querySelector('svg')).toBeNull()
    // Plain emphasis: no mango in the results.
    expect(items[0].innerHTML).not.toContain('mango')
  })

  it('hides the results until a seed is grown, with keyboard buttons for each', () => {
    renderHero()
    resultItems().forEach((li) => expect(li).not.toBeVisible())
    const button = screen.getByRole('button', { name: 'Show result: Production bugs, −96%' })
    fireEvent.click(button)
    expect(resultItems()[1]).toBeVisible()
  })

  it('still renders without results', () => {
    renderHero(null)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Results', hidden: true })).toBeNull()
  })

  it('shows the final grown state with all three results under reduced motion', () => {
    mockMatchMedia(['prefers-reduced-motion'])
    renderHero()
    resultItems().forEach((li) => expect(li).toBeVisible())
  })

  it('keeps the poster and lists the results when WebGL is unavailable', () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof original
    try {
      renderHero()
      expect(screen.getByTestId('hero-poster')).toBeInTheDocument()
      resultItems().forEach((li) => expect(li).toBeVisible())
      expect(screen.queryByText(/Click or tap the water/)).toBeNull()
      expect(screen.queryByRole('button', { name: 'Reset garden' })).toBeNull()
    } finally {
      HTMLCanvasElement.prototype.getContext = original
    }
  })

  it('loads the 3D scene after first paint and passes it the drawing box', async () => {
    renderHero()
    await waitFor(() => expect(scene.options).not.toBeNull())
    const options = scene.options!
    expect(options.results.map((r) => r.height)).toEqual([0.95, 0.96, expect.closeTo(0.61, 2)])
    expect(options.container).toContainElement(screen.getByTestId('hero-poster'))
    expect(options.lane()).toHaveLength(3)
    // A grown shoot shows its result.
    act(() => options.onProofShown(2))
    expect(resultItems()[2]).toBeVisible()
  })

  it('hides the hint after the first root and remembers it; Reset garden brings it back', async () => {
    renderHero()
    const hint = screen.getByText(/Click or tap the water/)
    expect(hint).not.toHaveClass('invisible')
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

  it('keeps the hint hidden on a return visit', () => {
    localStorage.setItem(HINT_KEY, '1')
    renderHero()
    expect(screen.getByText(/Click or tap the water/)).toHaveClass('invisible')
  })

  it('cleans up the scene on unmount', async () => {
    const { unmount } = renderHero()
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
    renderHero()
    await waitFor(() => expect(scene.options).not.toBeNull())
    expect(scene.options!.onMango).toBe(goToContact)
  })
})
