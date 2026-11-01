// In-page links between the home page's sections: a hero result, a timeline
// role or a Stack filter leads to a case study's card or archive row and
// marks it for a moment, so the eye lands on the right one.

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A case study's id on the home page: its Case card (featured) or its
// Archive row (archive); a case study is only ever one of the two.
export const caseAnchor = (slug: string) => `case-${slug}`

// How long the mangrove mark stays on the target (motion.css fades it out
// over the same time).
export const PULSE_MS = 1600

const timers = new WeakMap<HTMLElement, number>()

// Scrolls `id` to the middle of the viewport, marks it with data-pulse and
// moves focus to its first link (or the target itself), so keyboard and
// screen-reader users land where the eye does. Returns false when the target
// isn't on the page, so the caller can fall back to a normal link.
export function goTo(id: string): boolean {
  const target = document.getElementById(id)
  if (!target) return false

  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  const focusable = target.querySelector<HTMLElement>('a[href]') ?? target
  focusable.focus({ preventScroll: true })

  // Restart the mark when the same target is reached again.
  window.clearTimeout(timers.get(target))
  target.removeAttribute('data-pulse')
  void target.offsetWidth
  target.setAttribute('data-pulse', '')
  timers.set(
    target,
    window.setTimeout(() => target.removeAttribute('data-pulse'), PULSE_MS),
  )
  return true
}

// Brings a section into view only when none of it is on screen (the Stack
// filter sends the reader to Work this way), so a reader already looking at
// it isn't moved. Focus stays where it is.
export function revealSection(id: string): void {
  const section = document.getElementById(id)
  if (!section) return
  const { top, bottom } = section.getBoundingClientRect()
  if (bottom > 0 && top < window.innerHeight) return
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
