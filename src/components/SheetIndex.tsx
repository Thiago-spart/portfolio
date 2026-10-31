import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { formatMetric, type MetricValue } from '#/lib/metric'
import { cn } from '#/lib/utils'
import { useReadingSection } from '#/lib/useReadingSection'

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

// What each section holds, from data the home loader already has (counted
// in src/routes/index.tsx): the previews under the index entries.
export interface SheetStats {
  caseStudies: number
  // The first featured case study's headline result (the mango card's).
  best: MetricValue | null
  roles: number
  // The first role's start year.
  since: number | null
  // The tools the Stack rows show.
  techs: number
  questions: number
}

type T = ReturnType<typeof useTranslation>['t']
type Key = Parameters<T>[0]

const counted = (t: T, n: number, many: Key, one: Key) =>
  (n === 1 ? t(one) : t(many)).replace('{count}', String(n))

// One line per section: "13 case studies · best 40 → 95", "6 roles since
// 2019". A part without data is left out.
function sectionPreviews(stats: SheetStats, t: T): Record<SectionId, string> {
  const best = stats.best && t('index.preview.best').replace('{result}', formatMetric(stats.best))
  const since = stats.since && t('index.preview.since').replace('{year}', String(stats.since))
  return {
    projects: [counted(t, stats.caseStudies, 'index.preview.cases', 'index.preview.casesOne'), best]
      .filter(Boolean)
      .join(' · '),
    experience: [counted(t, stats.roles, 'index.preview.roles', 'index.preview.rolesOne'), since]
      .filter(Boolean)
      .join(' '),
    stack: counted(t, stats.techs, 'index.preview.tools', 'index.preview.toolsOne'),
    'how-i-work': counted(t, stats.questions, 'index.preview.questions', 'index.preview.questionsOne'),
    contact: t('index.preview.contact'),
  }
}

// The current-section rule under the desktop index: one element that
// slides to the current entry's cell (its offset and width, measured), so
// the eye follows the move instead of seeing two rules swap. Without a
// current section it fades out in place.
function useMarker(current: string | null, lang: string) {
  const listRef = useRef<HTMLOListElement>(null)
  const [box, setBox] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const cell = current ? list.querySelector<HTMLElement>(`a[href="#${current}"]`)?.closest('li') : null
      setBox(cell ? { left: cell.offsetLeft, width: cell.offsetWidth } : null)
    }
    measure()
    // Cells change width when the fonts load or the language changes.
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [current, lang])

  return { listRef, box }
}

// Whether the hero has left the screen. The index stays off the first
// screen: it appears once the hero has scrolled out above the viewport. The
// top inset counts the hero gone when only its bottom padding is left under
// the bar, so arriving at Projects from "See my work" already shows the
// index.
function useHeroGone() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-heading')?.closest('section')
    if (!hero) {
      setGone(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setGone(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { rootMargin: '-80px 0px 0px 0px' },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return gone
}

const SECTION_IDS = SHEET_SECTIONS.map((s) => s.id)

// The sheet index: a slim bar drawn like the drawing's title block (hairline
// cells, mono labels) that pins to the top of the viewport once the hero has
// scrolled away. The site header is not sticky, so this is the only bar that
// stays: one 48px strip instead of the 72px header plus an index.
//
// From 768px: every section, the one being read marked with ink and a 2px
// mangrove rule that slides between entries (aria-current="location"), and
// a Small Primary "Get in touch" at the right end. Hovering or focusing an
// entry drops a one-line preview of the section under it (its description;
// Escape hides it, WCAG 1.4.13). Phones: the current section as a
// disclosure that opens the full list, previews included, plus the same
// button.
//
// It's fixed, not in the flow, so showing it shifts nothing. Hidden, it sits
// above the viewport; keyboard focus brings it in (it comes right after the
// header in tab order), like a skip link.
export default function SheetIndex({ stats }: { stats: SheetStats }) {
  const { t, lang } = useTranslation()
  const shown = useHeroGone()
  const current = useReadingSection(SECTION_IDS)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const previewId = useId()
  // Escape hides the desktop previews until the pointer or focus moves on.
  const [quiet, setQuiet] = useState(false)
  const previews = sectionPreviews(stats, t)

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

  // On the document: a preview opened by hover has no focus in the nav.
  useEffect(() => {
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setQuiet(true)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      toggleRef.current?.focus()
    }
  }

  const { listRef, box } = useMarker(current, lang)

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
      data-quiet={quiet || undefined}
      onKeyDown={onKeyDown}
      className={cn(
        'group/nav fixed inset-x-0 top-0 z-40 border-b border-line bg-ground',
        'transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none',
        '-translate-y-full opacity-0 focus-within:translate-y-0 focus-within:opacity-100',
        'data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100',
      )}
    >
      <Container className="flex h-12 items-stretch justify-between gap-3">
        {/* From 768px: the full index, one hairline cell per section. */}
        <ol ref={listRef} className="relative m-0 hidden list-none border-x border-line p-0 md:flex">
          {SHEET_SECTIONS.map(({ id, label }, i) => (
            <li
              key={id}
              onPointerEnter={() => setQuiet(false)}
              className="group relative flex border-l border-line first:border-l-0"
            >
              <a
                {...linkProps(id)}
                aria-describedby={`${previewId}-${id}`}
                onFocus={() => setQuiet(false)}
                className="flex items-center gap-2 px-2 type-label whitespace-nowrap text-ink-muted no-underline transition-colors duration-150 ease-out hover:text-ink focus-visible:-outline-offset-2 aria-[current=location]:text-ink lg:px-4"
              >
                <span className="tabular-nums">{number(i)}</span>{' '}
                <span>{t(label)}</span>
              </a>
              {/* Inside the cell, so the pointer can move onto it. */}
              <p
                id={`${previewId}-${id}`}
                className={cn(
                  'absolute top-full left-0 m-0 -ml-px border border-line bg-ground px-3 py-2 type-small whitespace-nowrap text-ink-muted',
                  'invisible opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none',
                  'group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
                  'group-data-[quiet=true]/nav:invisible! group-data-[quiet=true]/nav:opacity-0!',
                )}
              >
                {previews[id]}
              </p>
            </li>
          ))}
          <span
            aria-hidden="true"
            data-testid="index-marker"
            style={box ? { translate: `${box.left}px`, width: `${box.width}px` } : undefined}
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 h-0.5 bg-mangrove',
              'transition-[translate,width] duration-300 ease-out motion-reduce:transition-none',
              !box && 'opacity-0',
            )}
          />
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
                  <span>{t(label)}</span>{' '}
                  <span className="ml-auto min-w-0 truncate type-small normal-case tracking-normal text-ink-muted">{previews[id]}</span>
                  <span
                    aria-hidden="true"
                    className={cn('size-2 shrink-0 rounded-full', current === id ? 'bg-mangrove' : 'bg-transparent')}
                  />
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </nav>
  )
}
