import { act } from '@testing-library/react'

// A controllable IntersectionObserver: each instance remembers its callback,
// options and targets, and `fire` delivers entries to whoever observes them.
export class FakeObserver {
  static instances: FakeObserver[] = []
  targets = new Set<Element>()
  constructor(
    public callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit = {},
  ) {
    FakeObserver.instances.push(this)
  }
  observe(el: Element) {
    this.targets.add(el)
  }
  unobserve(el: Element) {
    this.targets.delete(el)
  }
  disconnect() {
    this.targets.clear()
  }
  takeRecords() {
    return []
  }
}

export function fire(target: Element, isIntersecting: boolean, top = 0) {
  act(() => {
    for (const observer of FakeObserver.instances) {
      if (!observer.targets.has(target)) continue
      const entry = {
        target,
        isIntersecting,
        boundingClientRect: { top } as DOMRectReadOnly,
      } as IntersectionObserverEntry
      observer.callback([entry], observer as unknown as IntersectionObserver)
    }
  })
}
