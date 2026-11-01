import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { caseAnchor, goTo, PULSE_MS } from '../lib/inPage'

function reduceMotion(reduce: boolean) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  )
}

function card() {
  document.body.innerHTML = `<article id="${caseAnchor('redacao')}"><h3><a href="/projects/redacao">Redação</a></h3></article>`
  const target = document.getElementById(caseAnchor('redacao'))!
  target.scrollIntoView = vi.fn()
  return { target, link: target.querySelector('a')! }
}

describe('caseAnchor', () => {
  it('is the in-page id of a case study, on its card or archive row', () => {
    expect(caseAnchor('redacao')).toBe('case-redacao')
  })
})

describe('goTo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    reduceMotion(false)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('scrolls to the target and moves focus to its link without a second scroll', () => {
    const { target, link } = card()
    const focus = vi.spyOn(link, 'focus')
    expect(goTo(caseAnchor('redacao'))).toBe(true)
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(document.activeElement).toBe(link)
  })

  it('marks the target for a moment, then clears the mark', () => {
    const { target } = card()
    goTo(caseAnchor('redacao'))
    expect(target).toHaveAttribute('data-pulse')
    vi.advanceTimersByTime(PULSE_MS)
    expect(target).not.toHaveAttribute('data-pulse')
  })

  it('restarts the mark when the same target is reached again', () => {
    const { target } = card()
    goTo(caseAnchor('redacao'))
    vi.advanceTimersByTime(PULSE_MS - 100)
    goTo(caseAnchor('redacao'))
    vi.advanceTimersByTime(200)
    expect(target).toHaveAttribute('data-pulse')
  })

  it('jumps without smooth scrolling under reduced motion', () => {
    reduceMotion(true)
    const { target } = card()
    goTo(caseAnchor('redacao'))
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' })
  })

  it('returns false and does nothing when the target is not on the page', () => {
    document.body.innerHTML = ''
    expect(goTo(caseAnchor('missing'))).toBe(false)
  })
})
