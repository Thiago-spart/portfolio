// src/test/TimelineSection.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import TimelineSection from '../components/TimelineSection'
import type { SanityExperience } from '../types/sanity'

const mockExperiences: SanityExperience[] = [
  {
    _id: '1',
    company: 'Acme Corp',
    role: { en: 'Senior Developer', pt: 'Desenvolvedor Sênior', es: 'Desarrollador Senior' },
    description: { en: 'Built great things.', pt: 'Construí coisas ótimas.', es: 'Construí cosas geniales.' },
    startDate: '2022-01-01',
    endDate: null,
    techStack: ['React'],
    highlights: [],
  },
]

type ObserverCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void

let observedElements: Element[]
let capturedCallback: ObserverCallback | null

beforeEach(() => {
  observedElements = []
  capturedCallback = null

  class FakeIntersectionObserver {
    constructor(callback: ObserverCallback) {
      capturedCallback = callback
    }
    observe(el: Element) {
      observedElements.push(el)
    }
    unobserve(el: Element) {
      observedElements = observedElements.filter((e) => e !== el)
    }
    disconnect() {
      observedElements = []
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function fireIntersection(target: Element, isIntersecting: boolean) {
  capturedCallback?.([{ target, isIntersecting }])
}

describe('TimelineSection glitch-rise replay', () => {
  it('starts with cards hidden (opacity-0, no glitch-rise)', () => {
    const { container } = render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const card = container.querySelector('.relative.opacity-0') as HTMLElement
    expect(card).toBeTruthy()
    expect(card.classList.contains('glitch-rise')).toBe(false)
  })

  it('adds glitch-rise and removes opacity-0 when a card enters the viewport', () => {
    render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const card = observedElements[0] as HTMLElement
    fireIntersection(card, true)

    expect(card.classList.contains('opacity-0')).toBe(false)
    expect(card.classList.contains('glitch-rise')).toBe(true)
  })

  it('removes glitch-rise and restores opacity-0 when a card leaves the viewport', () => {
    render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const card = observedElements[0] as HTMLElement
    fireIntersection(card, true)
    fireIntersection(card, false)

    expect(card.classList.contains('glitch-rise')).toBe(false)
    expect(card.classList.contains('opacity-0')).toBe(true)
  })

  it('replays glitch-rise when a card re-enters the viewport after leaving', () => {
    render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const card = observedElements[0] as HTMLElement
    fireIntersection(card, true)
    fireIntersection(card, false)
    fireIntersection(card, true)

    expect(card.classList.contains('opacity-0')).toBe(false)
    expect(card.classList.contains('glitch-rise')).toBe(true)
  })

  it('never unobserves a card (stays observed across enter/exit cycles)', () => {
    render(
      <LanguageProvider>
        <TimelineSection experiences={mockExperiences} lang="en" />
      </LanguageProvider>,
    )
    const card = observedElements[0] as HTMLElement
    fireIntersection(card, true)
    fireIntersection(card, false)

    expect(observedElements).toContain(card)
  })
})
