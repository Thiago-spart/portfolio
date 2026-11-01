import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { HERO_RESULTS_QUERY_RESULT } from '#/types/sanity.generated'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { subscribeTheme, resolvedTheme } from '#/lib/theme'
import { cn } from '#/lib/utils'
import { GAUGE_TICKS, MangrovePoster, markY } from './hero/MangrovePoster'
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
  const headline = results[0]

  return (
    <section aria-labelledby="hero-heading" className="group/section overflow-x-clip">
      <Container className="grid gap-8 pt-4 pb-12 hero:grid-cols-[minmax(0,380px)_minmax(0,1fr)] hero:items-center hero:gap-0 hero:py-12 xl:grid-cols-[450px_minmax(0,1fr)]">
        <div className="flex flex-col items-start gap-6">
          <h1 id="hero-heading" className="m-0 type-display-l text-ink md:type-display-xl hero:type-display-l xl:type-display-xl">
            {`${t('hero.headline.line1')} ${t('hero.headline.line2')}`}
          </h1>
          <p className="m-0 type-lede text-ink">{t('hero.subtitle')}</p>
          {/* Phones and tablets: the headline result above the actions, in
              place of the lane's first label (from 900px it stands in the
              lane beside the drawing). */}
          {headline && (
            <div data-testid="hero-headline-result" className="hero:hidden">
              <ResultLabel result={headline} />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button href="#contact">{t('hero.cta.contact')}</Button>
            <Button href="#projects" variant="secondary">
              {t('hero.cta.projects')}
            </Button>
          </div>
        </div>
        <HeroDrawing results={results} />
      </Container>
    </section>
  )
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
        tide: t('hero.drawing.tide'),
        rootSpread: t('hero.drawing.rootSpread'),
        height: t('hero.drawing.height'),
      },
    }
  }
  return ref.current.labels
}

function HeroDrawing({ results }: { results: HeroResult[] }) {
  const { t } = useTranslation()
  const labels = useSceneLabels()
  const [mode, setMode] = useState<Mode>('poster')
  // Per result, bumped to replay its draw on the poster.
  const [replays, setReplays] = useState<number[]>(() => results.map(() => 0))
  const [hintSeen, setHintSeen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const laneRefs = useRef<Array<HTMLLIElement | null>>([])
  const sceneRef = useRef<MangroveScene | null>(null)
  const latest = useRef({ labels, results })
  latest.current = { labels, results }

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
            results: latest.current.results.map((r) => ({ height: r.height })),
            labels: latest.current.labels,
            reducedMotion: reduced,
            isDark: () => resolvedTheme() === 'dark',
            onMango: goToContact,
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
  const shown = results.slice(0, 3)

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
        className="relative aspect-[358/288] w-full overflow-hidden [background-image:linear-gradient(color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px)] [background-size:40px_40px] sm:aspect-[880/480] hero:max-h-[560px] hero:min-h-[300px] dark:[background-image:none]"
      >
        <MangrovePoster
          results={shown.map((r) => r.height)}
          replays={replays}
          onSeed={replay}
          className={cn(
            'mangrove-poster absolute transition-opacity duration-400 ease-out max-hero:top-0 max-hero:h-full max-sm:left-[-16.07%] max-sm:w-[147.35%] sm:max-hero:inset-0 sm:max-hero:w-full',
            mode === 'scene' && 'opacity-0',
          )}
        />
        <div ref={overlayRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" />
        <TitleBlock />
      </div>

      {/* Gauge numbers from 900px: HTML, so they stay legible at every
          drawing scale. The 3D scene draws its own. */}
      {shown.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-hero:hidden group-data-[mode=scene]/sheet:hidden">
          {GAUGE_TICKS.map(({ label, y }) => (
            <span
              key={label}
              style={{ '--y': y } as CSSProperties}
              className="mangrove-tick bg-ground px-px font-mono leading-[14px] font-medium text-ink-muted"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <ol
          aria-label={t('hero.results.label')}
          className="m-0 mt-6 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap hero:pointer-events-none hero:absolute hero:inset-x-0 hero:top-0 hero:z-20 hero:mt-0 hero:block hero:h-0"
        >
          {shown.map((result, i) => (
            <li
              key={result.key}
              ref={(el) => {
                laneRefs.current[i] = el
              }}
              style={{ '--i': i, '--my': markY(result.height) } as CSSProperties}
              // The first result already stands above the actions below 900px.
              className={cn('mangrove-lane-item hero:pointer-events-auto', i === 0 && 'max-hero:hidden')}
            >
              <span
                key={replays[i] ?? 0}
                aria-hidden="true"
                style={{ '--delay': `${950 + i * 200}ms` } as CSSProperties}
                className="mangrove-leader max-hero:hidden group-data-[mode=scene]/sheet:hidden"
              />
              <ResultLabel result={result} className="w-full hero:p-2" />
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 flex flex-col items-start gap-2 hero:mt-2 hero:flex-row hero:flex-wrap hero:items-center hero:gap-x-4 hero:gap-y-1 hero:pl-5">
        {!fallback && <p className={cn('m-0 type-code text-ink-muted', hintSeen && 'invisible')}>{t('hero.hint')}</p>}
        {/* Keyboard visitors: the same replay, from the buttons below. */}
        {shown.length > 0 && (
          <p className="m-0 hidden type-code text-ink-muted group-has-[:focus-visible]/section:block">{t('hero.hintKeys')}</p>
        )}
        {/* The seeds' keyboard twin: one stop replays every result (the
            labels already read them out). Hidden until focused. */}
        {shown.length > 0 && (
          <div className="sr-only focus-within:not-sr-only focus-within:flex focus-within:basis-full">
            <Button variant="secondary" size="small" onClick={() => shown.forEach((_, i) => replay(i))}>
              {t('hero.results.replay')}
            </Button>
          </div>
        )}
        {!fallback && (
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
