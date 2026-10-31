import { vi } from 'vitest'

type Update = (() => unknown) | { update: () => unknown; types?: string[] }

// Stands in for document.startViewTransition (jsdom has none): runs the
// update at once and records each call. `reducedMotion` flips the
// prefers-reduced-motion query the transition checks. Returns a restore().
export function fakeViewTransition({ reducedMotion = false } = {}) {
  const calls: Update[] = []
  const doc = document as unknown as { startViewTransition?: (u: Update) => unknown }
  doc.startViewTransition = (update: Update) => {
    calls.push(update)
    const done = Promise.resolve(typeof update === 'function' ? update() : update.update())
    return { updateCallbackDone: done, ready: done, finished: done }
  }
  // The router only honours transition types where the browser supports
  // them (jsdom has no window.CSS at all).
  const css = Object.getOwnPropertyDescriptor(window, 'CSS')
  Object.defineProperty(window, 'CSS', { configurable: true, value: { supports: () => true } })
  const matchMedia = vi.mocked(window.matchMedia)
  const original = matchMedia.getMockImplementation()
  matchMedia.mockImplementation((query: string) => ({
    ...original!(query),
    matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
  }))

  return {
    calls,
    restore() {
      delete doc.startViewTransition
      if (css) Object.defineProperty(window, 'CSS', css)
      else delete (window as { CSS?: unknown }).CSS
      matchMedia.mockImplementation(original!)
    },
  }
}
