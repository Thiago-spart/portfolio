import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'

// The home page's sections, in page order. The ids are the in-page anchors.
const SHEET_SECTIONS = [
  { id: 'projects', label: 'work.title' },
  { id: 'experience', label: 'experience.title' },
  { id: 'stack', label: 'stack.title' },
  { id: 'how-i-work', label: 'howIWork.title' },
  { id: 'contact', label: 'index.contact' },
] as const

type SectionId = (typeof SHEET_SECTIONS)[number]['id']

const number = (i: number) => String(i + 1).padStart(2, '0')

// The line a section has to cross to count as the one being read: a 1%
// band just under the middle of the viewport.
const READING_BAND = '-45% 0px -54% 0px'

// Which section is being read, and whether the hero has left the screen.
// IntersectionObserver only: no scroll handlers, no layout reads per frame.
function useSheetPosition() {
  const [shown, setShown] = useState(false)
  const [current, setCurrent] = useState<SectionId | null>(null)

  useEffect(() => {
    const hero = document.getElementById('hero-heading')?.closest('section')
    const sections = SHEET_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const footer = document.querySelector('body > footer')

    // The index stays off the first screen: it appears once the hero has
    // scrolled out above the viewport. The top inset counts the hero gone
    // when only its bottom padding is left under the bar, so arriving at
    // Projects from "See my work" already shows the index.
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { rootMargin: '-80px 0px 0px 0px' },
    )
    if (hero) heroObserver.observe(hero)
    else setShown(true)

    const inBand = new Set<string>()
    let atEnd = false
    const update = () => {
      // At the very end of the page the last section may never reach the
      // band; a fully visible footer means it's the one on screen.
      const id = atEnd ? 'contact' : SHEET_SECTIONS.find((s) => inBand.has(s.id))?.id
      setCurrent(id ?? null)
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        update()
      },
      { rootMargin: READING_BAND },
    )
    sections.forEach((el) => sectionObserver.observe(el))

    const endObserver = new IntersectionObserver(
      ([entry]) => {
        atEnd = entry.isIntersecting
        update()
      },
      { threshold: 1 },
    )
    if (footer) endObserver.observe(footer)

    return () => {
      heroObserver.disconnect()
      sectionObserver.disconnect()
      endObserver.disconnect()
    }
  }, [])

  return { shown, current }
}

// The sheet index: a slim bar drawn like the drawing's title block (hairline
// cells, mono labels) that pins to the top of the viewport once the hero has
// scrolled away. The site header is not sticky, so this is the only bar that
// stays: one 48px strip instead of the 72px header plus an index.
//
// From 768px: every section, the one being read marked with ink and a 2px
// mangrove rule (aria-current="location"), and a Small Primary "Get in
// touch" at the right end. Phones: the current section as a disclosure that
// opens the full list, plus the same button.
//
// It's fixed, not in the flow, so showing it shifts nothing. Hidden, it sits
// above the viewport; keyboard focus brings it in (it comes right after the
// header in tab order), like a skip link.
export default function SheetIndex() {
  const { t } = useTranslation()
  const { shown, current } = useSheetPosition()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // The phone list closes when the bar hides, and on a tap outside it.
  useEffect(() => {
    if (!shown) setOpen(false)
  }, [shown])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      toggleRef.current?.focus()
    }
  }

  const currentIndex = SHEET_SECTIONS.findIndex((s) => s.id === current)
  const currentSection = SHEET_SECTIONS[currentIndex] as (typeof SHEET_SECTIONS)[number] | undefined
  // In Contact, the section's own Email button is the primary action.
  const ctaHidden = current === 'contact'

  const linkProps = (id: SectionId) => ({
    href: `#${id}`,
    'aria-current': current === id ? ('location' as const) : undefined,
  })

  return (
    <nav
      ref={navRef}
      aria-label={t('index.label')}
      data-shown={shown}
      onKeyDown={onKeyDown}
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b border-line bg-ground',
        'transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none',
        '-translate-y-full opacity-0 focus-within:translate-y-0 focus-within:opacity-100',
        'data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100',
      )}
    >
      <Container className="flex h-12 items-stretch justify-between gap-3">
        {/* From 768px: the full index, one hairline cell per section. */}
        <ol className="m-0 hidden list-none border-x border-line p-0 md:flex">
          {SHEET_SECTIONS.map(({ id, label }, i) => (
            <li key={id} className="flex border-l border-line first:border-l-0">
              <a
                {...linkProps(id)}
                className="flex items-center gap-2 px-2 type-label whitespace-nowrap text-ink-muted no-underline transition-colors duration-150 ease-out hover:text-ink focus-visible:-outline-offset-2 aria-[current=location]:text-ink aria-[current=location]:shadow-[inset_0_-2px_0_var(--mangrove)] lg:px-4"
              >
                <span className="tabular-nums">{number(i)}</span>{' '}
                <span>{t(label)}</span>
              </a>
            </li>
          ))}
        </ol>

        {/* Phones: the section being read; it opens the full list. */}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="-ml-2 flex min-w-0 cursor-pointer items-center gap-2 rounded-sm border-0 bg-transparent px-2 type-label whitespace-nowrap text-ink focus-visible:-outline-offset-2 md:hidden"
        >
          {currentSection ? (
            <>
              <span className="sr-only">{t('index.label')}:</span>{' '}
              <span className="tabular-nums text-ink-muted">{number(currentIndex)}</span>{' '}
              <span className="truncate">{t(currentSection.label)}</span>
            </>
          ) : (
            <span>{t('index.label')}</span>
          )}
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={1.5}
            className={cn('shrink-0 transition-transform duration-150 ease-out', open && 'rotate-180')}
          />
        </button>

        <div className={cn('flex items-center', ctaHidden && 'invisible')}>
          <Button href="#contact" size="small">
            {t('hero.cta.contact')}
          </Button>
        </div>
      </Container>

      {/* Phones: the full list, dropping under the bar. */}
      <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full border-b border-line bg-ground md:hidden">
        <Container>
          <ol className="m-0 list-none p-0">
            {SHEET_SECTIONS.map(({ id, label }, i) => (
              <li key={id} className="border-b border-line last:border-b-0">
                <a
                  {...linkProps(id)}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 type-label whitespace-nowrap text-ink-muted no-underline focus-visible:-outline-offset-2 aria-[current=location]:text-ink"
                >
                  <span className="tabular-nums">{number(i)}</span>{' '}
                  <span>{t(label)}</span>
                  {current === id && (
                    <span aria-hidden="true" className="ml-auto size-2 rounded-full bg-mangrove" />
                  )}
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </nav>
  )
}
