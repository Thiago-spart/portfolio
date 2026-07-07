# Experience Section Scroll Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "glitch-rise" entrance animation on the experience/timeline cards replay every time a card scrolls into view, not just the first time.

**Architecture:** `TimelineSection.tsx`'s `useGlitchRise` hook already drives the animation via a single `IntersectionObserver`. Stop unobserving after the first trigger, and toggle the `opacity-0` / `glitch-rise` classes based on `entry.isIntersecting` so the card resets when it leaves the viewport and replays when it re-enters.

**Tech Stack:** React, TypeScript, Vitest + @testing-library/react (jsdom).

## Global Constraints

- No new dependencies (spec explicitly picked the vanilla `IntersectionObserver` approach over a motion library).
- No changes to `styles.css` — reuse the existing `glitch-rise` keyframes/timing.
- Reset on exit must be instant (no fade-out transition) per spec.
- No changes to `TimelineEntry.tsx` or other sections.

---

### Task 1: Replay glitch-rise animation on re-entry

**Files:**
- Modify: `src/components/TimelineSection.tsx:12-35` (the `useGlitchRise` hook)
- Test: `src/test/TimelineSection.test.tsx` (new file)

**Interfaces:**
- Consumes: `SanityExperience`, `Lang` types from `#/types/sanity` (already imported in `TimelineSection.tsx`); `LanguageProvider` from `../i18n/LanguageContext` (used the same way as in `src/test/TimelineEntry.test.tsx`).
- Produces: no new exports — `TimelineSection` default export's rendered DOM behavior changes (children toggle `opacity-0`/`glitch-rise` classes on intersection changes instead of only once).

The test needs a controllable fake `IntersectionObserver` since jsdom doesn't implement one. Capture the callback the component registers so the test can invoke it manually with fake entries.

- [ ] **Step 1: Write the failing test**

Create `src/test/TimelineSection.test.tsx`:

```tsx
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
    const { container } = render(
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- TimelineSection`
Expected: FAIL — at minimum the "removes glitch-rise and restores opacity-0 when a card leaves the viewport" and "replays glitch-rise" tests fail, since the current hook never removes `glitch-rise` / re-adds `opacity-0` and calls `unobserve` after the first trigger.

- [ ] **Step 3: Write minimal implementation**

Replace the `useGlitchRise` function in `src/components/TimelineSection.tsx` (currently lines 12-35):

```tsx
function useGlitchRise(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = Array.from(el.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement
          const index = children.indexOf(target)
          if (entry.isIntersecting) {
            target.style.animationDelay = `${index * 80}ms`
            target.classList.remove('opacity-0')   // remove before adding animation to avoid fill-mode conflict
            target.classList.add('glitch-rise')
          } else {
            target.classList.remove('glitch-rise')
            target.classList.add('opacity-0')
          }
        })
      },
      { threshold: 0.1 },
    )
    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [ref])
}
```

The only changes from the original: the `else` branch resetting `opacity-0`/`glitch-rise`, and removing the `observer.unobserve(entry.target)` call so the observer keeps watching every card indefinitely.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- TimelineSection`
Expected: PASS (all 5 tests in `src/test/TimelineSection.test.tsx`)

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `pnpm test`
Expected: PASS (no regressions in `TimelineEntry.test.tsx` or other existing tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/TimelineSection.tsx src/test/TimelineSection.test.tsx
git commit -m "feat: replay experience timeline glitch-rise animation on re-entry"
```
