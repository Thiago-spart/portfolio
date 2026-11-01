import { useEffect, useState } from 'react'

// The line a section has to cross to count as the one being read: a 1%
// band just under the middle of the viewport.
export const READING_BAND = '-45% 0px -54% 0px'

// Which of `ids` is being read: the first, in the order given, that crosses
// the reading band. At the very end of the page the last section may never
// reach the band; a fully visible footer means it's the one on screen.
// IntersectionObserver only: no scroll handlers, no layout reads per frame.
// Used by the home page's sheet index and a case study's contents.
export function useReadingSection<Id extends string>(ids: readonly Id[]): Id | null {
  const [current, setCurrent] = useState<Id | null>(null)
  // A stable dependency, so an inline array doesn't re-observe every render.
  const key = ids.join(' ')

  useEffect(() => {
    const list = key.split(' ') as Id[]
    const sections = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const footer = document.querySelector('body > footer')

    const inBand = new Set<string>()
    let atEnd = false
    const update = () => {
      setCurrent(atEnd ? list[list.length - 1] : (list.find((id) => inBand.has(id)) ?? null))
    }

    const bandObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        update()
      },
      { rootMargin: READING_BAND },
    )
    sections.forEach((el) => bandObserver.observe(el))

    const endObserver = new IntersectionObserver(
      ([entry]) => {
        atEnd = entry.isIntersecting
        update()
      },
      { threshold: 1 },
    )
    if (footer) endObserver.observe(footer)

    return () => {
      bandObserver.disconnect()
      endObserver.disconnect()
    }
  }, [key])

  return current
}
