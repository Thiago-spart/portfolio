import { useEffect, useMemo, useRef, useState } from 'react'
import type { HERO_RESULTS_QUERY_RESULT } from '#/types/sanity.generated'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { subscribeTheme, resolvedTheme } from '#/lib/theme'
import { cn } from '#/lib/utils'
import { MangrovePoster } from './hero/MangrovePoster'
import { ResultLabel } from './hero/ResultLabel'
import { toHeroResults, type HeroResult } from './hero/heroResults'
import {
  HINT_KEY,
  ROOTS_KEY,
  goToContact,
  hasWebGL,
  prefersReducedMotion,
  readStore,
  whenIdleAfterLoad,
  writeStore,
} from './hero/heroShell'
import type { MangroveScene, SceneLabels } from './hero/mangroveScene'

// poster: server render and until the 3D scene is ready (the Figma Idle
// frame). scene: the canvas has taken over. fallback: no WebGL, or the scene
// failed: the poster stays and the results are listed under it.
type Mode = 'poster' | 'scene' | 'fallback'

interface HeroSectionProps {
  results?: HERO_RESULTS_QUERY_RESULT
}

// Figma: Hero / Idle (20:713, 22:1914, 22:2263), Results (21:1165, 22:2605),
// Poster (21:1969, 22:3233). Copy left and the drawing right from 900px;
// copy above the drawing below it.
export default function HeroSection({ results: rows }: HeroSectionProps) {
  const { t, lang } = useTranslation()
  const results = useMemo(() => toHeroResults(rows ?? undefined, lang), [rows, lang])

  return (
    <section aria-labelledby="hero-heading" className="overflow-x-clip">
      <Container className="grid gap-8 pt-4 pb-12 hero:min-h-[calc(100svh-var(--space-16)-var(--space-2)-var(--space-24))] hero:grid-cols-[minmax(0,380px)_minmax(0,1fr)] hero:items-center hero:gap-0 hero:py-12 xl:grid-cols-[450px_minmax(0,1fr)]">
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
  const [active, setActive] = useState<boolean[]>(() => results.map(() => false))
  const [hintSeen, setHintSeen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const laneRefs = useRef<Array<HTMLLIElement | null>>([])
  const sceneRef = useRef<MangroveScene | null>(null)
  const latest = useRef({ labels, active, results })
  latest.current = { labels, active, results }

  const show = (i: number) => setActive((prev) => prev.map((v, j) => v || j === i))

  useEffect(() => {
    setHintSeen(readStore(HINT_KEY) === '1')
    const reduced = prefersReducedMotion()
    // Reduced motion: the final grown state, all results showing.
    if (reduced) setActive(latest.current.results.map(() => true))

    const forcePoster = new URLSearchParams(window.location.search).has('poster')
    if (forcePoster || !hasWebGL()) {
      setMode('fallback')
      return
    }

    let disposed = false
    const cancel = whenIdleAfterLoad(() => {
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
            onProofShown: show,
            onPlant: () => {
              setHintSeen(true)
              writeStore(HINT_KEY, '1')
            },
            readStore,
            writeStore,
            storageKey: ROOTS_KEY,
          })
          sceneRef.current = scene
          // Results asked for from the keyboard before the scene was ready.
          latest.current.active.forEach((on, i) => on && scene.activateProof(i))
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

  const showResult = (i: number) => {
    if (sceneRef.current) sceneRef.current.activateProof(i)
    else show(i)
  }

  const fallback = mode === 'fallback'
  const visible = (i: number) => fallback || active[i]

  return (
    <div ref={heroRef} className="relative min-w-0 hero:-mr-[max(var(--space-6),calc((100vw-var(--content-max))/2))]">
      {/* The drawing box: its size is reserved before anything loads (no
          layout shift when the canvas mounts). Drafting grid by day. */}
      <div
        ref={boxRef}
        data-mode={mode}
        className="relative aspect-[358/288] w-full overflow-hidden [background-image:linear-gradient(color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--line)_70%,transparent)_1px,transparent_1px)] [background-size:40px_40px] sm:aspect-[880/480] hero:max-h-[560px] hero:min-h-[300px] dark:[background-image:none]"
      >
        <MangrovePoster
          className={cn(
            'absolute top-0 h-full transition-opacity duration-400 ease-out max-sm:left-[-16.07%] max-sm:w-[147.35%] sm:inset-0 sm:w-full',
            mode === 'scene' && 'opacity-0',
          )}
        />
        <div ref={overlayRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" />
        <TitleBlock />
      </div>

      {results.length > 0 && (
        <ol
          aria-label={t('hero.results.label')}
          className={cn(
            'm-0 list-none p-0',
            fallback
              ? 'mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap'
              : 'flex flex-col gap-3 has-[li:not([hidden])]:mt-6 hero:has-[li:not([hidden])]:mt-0',
            !fallback && mode === 'poster' && 'hero:absolute hero:top-[8%] hero:right-6 hero:w-58',
            !fallback && mode === 'scene' && 'hero:pointer-events-none hero:absolute hero:inset-x-0 hero:top-0 hero:z-20 hero:size-0',
          )}
        >
          {results.map((result, i) => (
            <li
              key={result.key}
              ref={(el) => {
                laneRefs.current[i] = el
              }}
              hidden={!visible(i)}
              className={cn(
                mode === 'scene' && 'hero:absolute hero:top-0 hero:left-0 hero:w-max hero:max-w-58',
              )}
            >
              <ResultLabel result={result} className="w-full" />
            </li>
          ))}
        </ol>
      )}

      {!fallback && (
        <div className="mt-8 flex flex-col items-start gap-1 hero:mt-2 hero:flex-row hero:flex-wrap hero:items-center hero:gap-4 hero:pl-5">
          <p className={cn('m-0 type-code text-ink-muted', hintSeen && 'invisible')}>{t('hero.hint')}</p>
          <Button variant="ghost" size="small" onClick={resetGarden}>
            {t('hero.reset')}
          </Button>
          {/* Keyboard twins of the marked seeds: hidden until focused. */}
          {results.length > 0 && (
            <div
              role="group"
              aria-label={t('hero.results.label')}
              className="sr-only focus-within:not-sr-only focus-within:flex focus-within:basis-full focus-within:flex-wrap focus-within:gap-2"
            >
              {results.map((result, i) => (
                <Button key={result.key} variant="secondary" size="small" onClick={() => showResult(i)}>
                  {t('hero.results.show').replace('{label}', result.label).replace('{value}', result.text)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
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
      className="pointer-events-none absolute right-1 bottom-1 z-10 hidden grid-cols-[auto_auto] border border-ink bg-ground font-mono text-[10px] leading-[15px] font-medium tracking-[0.06em] text-ink uppercase md:max-hero:grid xl:grid"
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
