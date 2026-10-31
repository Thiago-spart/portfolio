import { useEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react'
import type { HERO_RESULTS_QUERY_RESULT } from '#/types/sanity.generated'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { subscribeTheme, resolvedTheme } from '#/lib/theme'
import { cn } from '#/lib/utils'
import { MangrovePoster, markY } from './hero/MangrovePoster'
import { ResultLabel } from './hero/ResultLabel'
import { toHeroResults, type HeroResult } from './hero/heroResults'
import {
  HINT_KEY,
  ROOTS_KEY,
  goToContact,
  hasWebGL,
  prefersReducedMotion,
  readStore,
  whenEngaged,
  writeStore,
} from './hero/heroShell'
import type { MangroveScene, SceneLabels } from './hero/mangroveScene'

// poster: server render and until the 3D scene is ready (the Figma Results
// frame: every result drawn and labelled). scene: the canvas has taken over.
// fallback: no WebGL, or the scene failed: the poster stays.
type Mode = 'poster' | 'scene' | 'fallback'

interface HeroSectionProps {
  results?: HERO_RESULTS_QUERY_RESULT
}

// Figma: Hero / Results (21:1165, 22:2605), Poster (21:1969, 22:3233). Copy
// left and the drawing right from 900px; copy above the drawing below it.
// The results show from the first paint: result first, method second.
export default function HeroSection({ results: rows }: HeroSectionProps) {
  const { t, lang } = useTranslation()
  const results = useMemo(() => toHeroResults(rows ?? undefined, lang), [rows, lang])
  // The result whose label, or shoot, is hovered or focused: the label and
  // its shoot and dimension line are marked together.
  const [active, setActive] = useState<number | null>(null)

  return (
    <section aria-labelledby="hero-heading" className="group/section overflow-x-clip">
      <Container className="grid gap-8 pt-4 pb-12 hero:grid-cols-[minmax(0,380px)_minmax(0,1fr)] hero:items-center hero:gap-0 hero:py-12 xl:grid-cols-[450px_minmax(0,1fr)]">
        <div className="flex flex-col items-start gap-6">
          <h1 id="hero-heading" className="m-0 type-display-l text-ink md:type-display-xl hero:type-display-l xl:type-display-xl">
            {`${t('hero.headline.line1')} ${t('hero.headline.line2')}`}
          </h1>
          <p className="m-0 type-lede text-ink">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="#contact">{t('hero.cta.contact')}</Button>
            <Button href="#projects" variant="secondary">
              {t('hero.cta.projects')}
            </Button>
          </div>
          {/* Phones and tablets: the three results together, right after the
              actions, and the drawing after them (from 900px they stand in
              the lane beside the drawing instead). After the actions, not
              before: three labels above the buttons would push both off a
              phone's first screen, and here they lead from the copy into
              the work, each to its case card. */}
          {results.length > 0 && (
            <ol
              data-testid="hero-results-group"
              aria-label={t('hero.results.label')}
              className="m-0 grid w-full list-none gap-3 p-0 sm:grid-cols-3 hero:hidden"
            >
              {results.map((result, i) => (
                <li key={result.key} className="flex">
                  <ResultLabel result={result} active={active === i} onActive={labelActive(setActive, i)} className="w-full" />
                </li>
              ))}
            </ol>
          )}
        </div>
        <HeroDrawing results={results} active={active} onActive={setActive} />
      </Container>
    </section>
  )
}

// A label leaves the highlight only if it still holds it (moving from one
// label to the next can fire the next one's enter first).
const labelActive = (set: Dispatch<SetStateAction<number | null>>, i: number) => (on: boolean) => {
  if (on) set(i)
  else set((current) => (current === i ? null : current))
}

// The drawing's annotation text; a new object only when the language changes.
function useSceneLabels(): SceneLabels {
  const { t, lang } = useTranslation()
  const ref = useRef<{ lang: string; labels: SceneLabels } | null>(null)
  if (ref.current?.lang !== lang) {
    ref.current = {
      lang,
      labels: {
        propRoot: t('hero.drawing.propRoot'),
        canopy: t('hero.drawing.canopy'),
        contact: t('hero.drawing.contact'),
      },
    }
  }
  return ref.current.labels
}

interface HeroDrawingProps {
  results: HeroResult[]
  active: number | null
  onActive: Dispatch<SetStateAction<number | null>>
}

function HeroDrawing({ results, active, onActive }: HeroDrawingProps) {
  const { t } = useTranslation()
  const labels = useSceneLabels()
  const [mode, setMode] = useState<Mode>('poster')
  // Per result, bumped to replay its draw on the poster.
  const [replays, setReplays] = useState<number[]>(() => results.map(() => 0))
  const [hintSeen, setHintSeen] = useState(false)
  // Below 900px the hint waits for a first tap on the drawing, so it isn't
  // in the reading path between the results and the work.
  const [tapped, setTapped] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const laneRefs = useRef<Array<HTMLLIElement | null>>([])
  const sceneRef = useRef<MangroveScene | null>(null)
  const latest = useRef({ labels, results, onActive })
  latest.current = { labels, results, onActive }

  useEffect(() => {
    setHintSeen(readStore(HINT_KEY) === '1')
    const reduced = prefersReducedMotion()

    const forcePoster = new URLSearchParams(window.location.search).has('poster')
    if (forcePoster || !hasWebGL()) {
      setMode('fallback')
      return
    }

    let disposed = false
    const cancel = whenEngaged(() => {
      import('./hero/mangroveScene')
        .then(({ createScene }) => {
          const box = boxRef.current
          const overlay = overlayRef.current
          const hero = heroRef.current?.closest('section')
          if (disposed || !box || !overlay || !hero) return
          const scene = createScene({
            container: box,
            overlay,
            hero,
            lane: () => laneRefs.current,
            results: latest.current.results.map((r) => ({ height: r.height, text: r.text, product: r.product })),
            labels: latest.current.labels,
            reducedMotion: reduced,
            isDark: () => resolvedTheme() === 'dark',
            onMango: goToContact,
            onHover: (i) => latest.current.onActive(i),
            onPlant: () => {
              setHintSeen(true)
              writeStore(HINT_KEY, '1')
            },
            readStore,
            writeStore,
            storageKey: ROOTS_KEY,
          })
          sceneRef.current = scene
          setMode('scene')
        })
        .catch((err: unknown) => {
          console.warn('[hero] 3D scene unavailable, keeping the poster.', err)
          if (!disposed) setMode('fallback')
        })
    })
    const unsubscribe = subscribeTheme(() => sceneRef.current?.setTheme())

    return () => {
      disposed = true
      cancel()
      unsubscribe()
      sceneRef.current?.destroy()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.setLabels(labels)
  }, [labels])

  useEffect(() => {
    sceneRef.current?.setHighlight(active)
  }, [active, mode])

  const resetGarden = () => {
    sceneRef.current?.reset()
    writeStore(ROOTS_KEY, null)
    writeStore(HINT_KEY, null)
    setHintSeen(false)
  }

  // A seed (or its keyboard twin) replays its result: the shoot grows again
  // and the dimension line runs back to the gauge. The label stays put.
  const replay = (i: number) => {
    if (sceneRef.current) sceneRef.current.replayProof(i)
    else setReplays((prev) => results.map((_, j) => (prev[j] ?? 0) + (j === i ? 1 : 0)))
  }

  const fallback = mode === 'fallback'

  return (
    <div
      ref={heroRef}
      data-mode={mode}
      className="mangrove-sheet group/sheet relative min-w-0 hero:-mr-[max(var(--space-6),calc((100vw-var(--content-max))/2))]"
    >
      {/* The drawing box: its size is reserved before anything loads (no
          layout shift when the canvas mounts). Drafting grid by day. */}
      <div
        ref={boxRef}
        onPointerDown={() => setTapped(true)}
        className="relative aspect-[358/288] w-full overflow-hidden [background-image:linear-gradient(color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px)] [background-size:40px_40px] sm:aspect-[880/480] hero:max-h-[560px] hero:min-h-[300px] dark:[background-image:none]"
      >
        <MangrovePoster
          results={results.map((r) => r.height)}
          labels={results.map((r) => r.text)}
          products={results.map((r) => r.product)}
          active={active}
          replays={replays}
          onSeed={replay}
          onHover={onActive}
          className={cn(
            'mangrove-poster absolute transition-opacity duration-400 ease-out max-hero:top-0 max-hero:h-full max-sm:left-[-16.07%] max-sm:w-[147.35%] sm:max-hero:inset-0 sm:max-hero:w-full',
            mode === 'scene' && 'opacity-0',
          )}
        />
        <div ref={overlayRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" />
        <TitleBlock />
      </div>

      {results.length > 0 && (
        <ol
          data-testid="hero-lane"
          aria-label={t('hero.results.label')}
          className="pointer-events-none absolute inset-x-0 top-0 z-20 m-0 block h-0 list-none p-0 max-hero:hidden"
        >
          {results.map((result, i) => (
            <li
              key={result.key}
              data-active={active === i || undefined}
              ref={(el) => {
                laneRefs.current[i] = el
              }}
              style={{ '--i': i, '--my': markY(result.height) } as CSSProperties}
              className="mangrove-lane-item pointer-events-auto"
            >
              <span
                key={replays[i] ?? 0}
                aria-hidden="true"
                data-active={active === i || undefined}
                style={{ '--delay': `${950 + i * 200}ms` } as CSSProperties}
                className="mangrove-leader group-data-[mode=scene]/sheet:hidden data-active:h-0.5"
              />
              <ResultLabel result={result} active={active === i} onActive={labelActive(onActive, i)} className="w-full hero:p-2" />
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 flex flex-col items-start gap-2 hero:mt-2 hero:flex-row hero:flex-wrap hero:items-center hero:gap-x-4 hero:gap-y-1 hero:pl-5">
        {!fallback && (
          <p className={cn('m-0 type-code text-ink-muted', hintSeen && 'invisible', !tapped && 'max-hero:hidden')}>{t('hero.hint')}</p>
        )}
        {/* Keyboard visitors: the same replay, from the buttons below. */}
        {results.length > 0 && (
          <p className="m-0 hidden type-code text-ink-muted group-has-[:focus-visible]/section:block">{t('hero.hintKeys')}</p>
        )}
        {/* The seeds' keyboard twin: one stop replays every result (the
            labels already read them out). Hidden until focused. */}
        {results.length > 0 && (
          <div className="sr-only focus-within:not-sr-only focus-within:flex focus-within:basis-full">
            <Button variant="secondary" size="small" onClick={() => results.forEach((_, i) => replay(i))}>
              {t('hero.results.replay')}
            </Button>
          </div>
        )}
        {/* Only once there is something to reset. */}
        {!fallback && hintSeen && (
          <button
            type="button"
            aria-label={t('hero.reset')}
            onClick={resetGarden}
            className="-mx-1 min-h-6 cursor-pointer rounded-sm bg-transparent px-1 type-code text-ink-muted underline-offset-4 hover:text-mangrove hover:underline"
          >
            {t('hero.resetShort')}
          </button>
        )}
      </div>
    </div>
  )
}

// The drawing's title block, bottom-right of the sheet (Figma 15:49).
function TitleBlock() {
  const { t } = useTranslation()
  const cell = 'border-ink px-[9px] py-[5px]'
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-1 bottom-1 z-10 hidden grid-cols-[auto_auto] border border-ink bg-ground font-mono text-[11px] leading-[16px] font-medium tracking-[0.06em] text-ink uppercase md:max-hero:grid xl:grid"
    >
      <span className={cn(cell, 'border-r border-b')}>{t('hero.drawing.sheet')}</span>
      <span className={cn(cell, 'border-b')}>{t('hero.drawing.scale')}</span>
      <span className={cn(cell, 'border-r')}>
        <span className="dark:hidden">{t('hero.drawing.day')}</span>
        <span className="hidden dark:inline">{t('hero.drawing.night')}</span>
      </span>
      <span className={cell}>{t('hero.drawing.rev')}</span>
    </div>
  )
}
