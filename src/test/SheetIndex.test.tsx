import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import SheetIndex, { type SheetStats } from '../components/SheetIndex'
import { FakeObserver, fire } from './fakeObserver'

const IDS = ['projects', 'experience', 'stack', 'how-i-work', 'contact']

const STATS: SheetStats = {
  caseStudies: 13,
  best: { before: 40, after: 95 },
  roles: 6,
  since: 2019,
  techs: 14,
  questions: 6,
}

// The home page's landmarks the index watches: the hero, the five sections
// and the footer, around the index itself.
function renderPage(stats: SheetStats = STATS) {
  const utils = render(
    <LanguageProvider>
      <main>
        <SheetIndex stats={stats} />
        <section aria-labelledby="hero-heading">
          <h1 id="hero-heading">Engineering you can measure.</h1>
        </section>
        {IDS.map((id) => (
          <section key={id} id={id} />
        ))}
      </main>
    </LanguageProvider>,
  )
  return utils
}

const nav = () => screen.getByRole('navigation', { name: 'Sections' })
const desktopList = () => nav().querySelector('ol') as HTMLOListElement
const hero = () => document.querySelector('section[aria-labelledby="hero-heading"]') as HTMLElement
const section = (id: string) => document.getElementById(id) as HTMLElement

let original: typeof IntersectionObserver

beforeEach(() => {
  original = window.IntersectionObserver
  FakeObserver.instances = []
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
  // Footer lives outside the rendered tree, as in the root document.
  document.body.appendChild(document.createElement('footer'))
})

afterEach(() => {
  window.IntersectionObserver = original
  document.querySelector('body > footer')?.remove()
  localStorage.clear()
})

describe('SheetIndex', () => {
  it('links to all five sections, numbered, in page order', () => {
    renderPage()
    const links = within(desktopList()).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(IDS.map((id) => `#${id}`))
    expect(links.map((a) => a.textContent)).toEqual([
      '01 Projects',
      '02 Experience',
      '03 Stack',
      '04 How I work',
      '05 Contact',
    ])
  })

  it('is hidden over the hero and shown once the hero has scrolled away', () => {
    renderPage()
    expect(nav()).toHaveAttribute('data-shown', 'false')
    expect(nav()).toHaveClass('-translate-y-full', 'opacity-0')
    // Scrolled out above the viewport.
    fire(hero(), false, -900)
    expect(nav()).toHaveAttribute('data-shown', 'true')
    // Back on the first screen.
    fire(hero(), true, -100)
    expect(nav()).toHaveAttribute('data-shown', 'false')
  })

  it('shows itself on keyboard focus even while the hero is on screen', () => {
    renderPage()
    expect(nav()).toHaveClass('focus-within:translate-y-0', 'focus-within:opacity-100')
  })

  it('marks the section crossing the reading band with aria-current="location"', () => {
    renderPage()
    const band = FakeObserver.instances.find((o) => o.targets.has(section('projects')))
    expect(band?.options.rootMargin).toBe('-45% 0px -54% 0px')
    const link = (id: string) => desktopList().querySelector(`a[href="#${id}"]`)

    expect(within(desktopList()).queryByRole('link', { current: 'location' })).toBeNull()
    fire(section('experience'), true)
    expect(link('experience')).toHaveAttribute('aria-current', 'location')
    expect(link('projects')).not.toHaveAttribute('aria-current')

    fire(section('experience'), false)
    fire(section('stack'), true)
    expect(link('stack')).toHaveAttribute('aria-current', 'location')
    expect(link('experience')).not.toHaveAttribute('aria-current')
  })

  it('marks Contact once the footer is fully on screen', () => {
    renderPage()
    fire(section('how-i-work'), true)
    fire(document.querySelector('body > footer') as Element, true)
    expect(within(desktopList()).getByRole('link', { name: /contact/i })).toHaveAttribute('aria-current', 'location')
  })

  it('ends with a Small Primary "Get in touch" to #contact, hidden while Contact is on screen', () => {
    renderPage()
    const cta = within(nav()).getByRole('link', { name: 'Get in touch' })
    expect(cta).toHaveAttribute('href', '#contact')
    expect(cta).toHaveClass('bg-mangrove', 'h-8')
    expect(cta.parentElement).not.toHaveClass('invisible')
    fire(section('contact'), true)
    expect(cta.parentElement).toHaveClass('invisible')
  })

  it('collapses to the current section on phones, as a disclosure that opens the list', () => {
    renderPage()
    const toggle = within(nav()).getByRole('button')
    expect(toggle).toHaveClass('md:hidden')
    expect(desktopList()).toHaveClass('hidden', 'md:flex')
    expect(toggle).toHaveAccessibleName('Sections')

    fire(section('experience'), true)
    expect(toggle).toHaveAccessibleName('Sections: 02 Experience')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const panel = document.getElementById(toggle.getAttribute('aria-controls')!) as HTMLElement
    expect(panel).not.toBeVisible()
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()
    const rows = within(panel).getAllByRole('link')
    expect(rows.map((a) => a.getAttribute('href'))).toEqual(IDS.map((id) => `#${id}`))
    expect(rows[1]).toHaveAttribute('aria-current', 'location')

    // Choosing a section closes the list.
    fireEvent.click(rows[2])
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the phone list with Escape and returns focus to its button', () => {
    renderPage()
    const toggle = within(nav()).getByRole('button')
    fireEvent.click(toggle)
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!) as HTMLElement
    within(panel).getAllByRole('link')[0].focus()
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('translates the index', () => {
    localStorage.setItem('lang', 'pt')
    renderPage()
    const nav = screen.getByRole('navigation', { name: 'Seções' })
    const links = within(nav.querySelector('ol') as HTMLElement).getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual([
      '01 Projetos',
      '02 Experiência',
      '03 Stack',
      '04 Como eu trabalho',
      '05 Contato',
    ])
    expect(within(nav).getByRole('link', { name: 'Entre em contato' })).toBeInTheDocument()
  })

  describe('previews', () => {
    const PREVIEWS = [
      '13 case studies · best 40 → 95',
      '6 roles since 2019',
      '14 tools',
      '6 questions',
      'Email · EN, PT, ES',
    ]

    it('describes each section in one line, on hover or focus from 768px', () => {
      renderPage()
      const links = within(desktopList()).getAllByRole('link')
      expect(links.map((a) => a.textContent)).toEqual([
        '01 Projects',
        '02 Experience',
        '03 Stack',
        '04 How I work',
        '05 Contact',
      ])
      // The preview describes the link rather than naming it.
      links.forEach((a, i) => expect(a).toHaveAccessibleDescription(PREVIEWS[i]))
      const preview = document.getElementById(links[0].getAttribute('aria-describedby')!) as HTMLElement
      expect(preview).toHaveClass('invisible', 'group-hover:visible', 'group-focus-within:visible')
    })

    it('shows the previews in the phone list', () => {
      renderPage()
      const toggle = within(nav()).getByRole('button')
      const panel = document.getElementById(toggle.getAttribute('aria-controls')!) as HTMLElement
      // Closed, so the links are hidden from the accessibility tree.
      within(panel)
        .getAllByRole('link', { hidden: true })
        .forEach((a, i) => expect(a).toHaveTextContent(PREVIEWS[i]))
    })

    it('leaves out what it has no data for', () => {
      renderPage({ ...STATS, best: null, since: null })
      const [work, experience] = within(desktopList()).getAllByRole('link')
      expect(work).toHaveAccessibleDescription('13 case studies')
      expect(experience).toHaveAccessibleDescription('6 roles')
    })

    it('counts one in the singular', () => {
      renderPage({ ...STATS, caseStudies: 1, best: null, roles: 1, techs: 1, questions: 1 })
      expect(within(desktopList()).getAllByRole('link').map((a) => a.getAttribute('aria-describedby') && document.getElementById(a.getAttribute('aria-describedby')!)?.textContent)).toEqual([
        '1 case study',
        '1 role since 2019',
        '1 tool',
        '1 question',
        'Email · EN, PT, ES',
      ])
    })

    it('hides the previews with Escape until the pointer or focus moves on (WCAG 1.4.13)', () => {
      renderPage()
      const [first, second] = within(desktopList()).getAllByRole('link')
      act(() => first.focus())
      fireEvent.keyDown(first, { key: 'Escape' })
      expect(nav()).toHaveAttribute('data-quiet', 'true')
      act(() => second.focus())
      expect(nav()).not.toHaveAttribute('data-quiet')
    })

    it('translates the previews', () => {
      localStorage.setItem('lang', 'es')
      renderPage()
      const list = screen.getByRole('navigation', { name: 'Secciones' }).querySelector('ol') as HTMLElement
      expect(within(list).getAllByRole('link')[0]).toHaveAccessibleDescription('13 casos de estudio · mejor 40 → 95')
    })
  })

  describe('current marker', () => {
    beforeEach(() => {
      // jsdom has no layout: each link is 100px wide, side by side.
      vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
        const li = this.closest('li')
        return li ? [...li.parentElement!.children].indexOf(li) * 100 : 0
      })
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    })
    afterEach(() => vi.restoreAllMocks())

    it('is one rule that slides under the current section, without motion when reduced', () => {
      renderPage()
      const marker = within(nav()).getByTestId('index-marker')
      expect(marker).toHaveAttribute('aria-hidden', 'true')
      expect(marker).toHaveClass('opacity-0')
      // The links no longer draw their own rule.
      within(desktopList()).getAllByRole('link').forEach((a) => expect(a.className).not.toContain('shadow'))

      fire(section('stack'), true)
      expect(marker).not.toHaveClass('opacity-0')
      expect(marker.style.translate).toBe('200px')
      expect(marker.style.width).toBe('100px')

      fire(section('stack'), false)
      fire(section('how-i-work'), true)
      expect(marker.style.translate).toBe('300px')
      expect(marker).toHaveClass('transition-[translate,width]', 'motion-reduce:transition-none')
    })
  })
})
