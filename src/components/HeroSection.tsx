// src/components/HeroSection.tsx
import React, { Suspense, lazy } from 'react'
import { useTranslation } from '#/i18n/useTranslation'

// three/@react-three/fiber/@react-three/drei/postprocessing are heavy
// (1.14MB) and only needed on the home page — lazy-load them out of the
// shared route bundle (issue #11).
const HeroCanvas = lazy(() => import('./HeroCanvas'))

// Matches HeroCanvas's own container sizing so swapping in the resolved
// canvas doesn't shift the layout.
function HeroCanvasFallback() {
  return <div className="relative h-[50dvh] w-full lg:h-[70dvh]" />
}

class HeroErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: false }
  }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) return null
    return this.props.children
  }
}

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section>
      <div className="flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[55fr_45fr] lg:px-12">
          {/* Left column */}
          <div className="flex flex-col justify-center gap-6">
            {/* Badge */}
            <div className="flex items-center gap-2 self-start rounded-full border border-line bg-surface-raised px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-score-good" />
              <span className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-none tracking-wider text-ink">
              <span className="block">{t('hero.headline.line1')}</span>
              <span
                className="block"
              >
                {t('hero.headline.line2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[480px] text-base text-ink-muted sm:text-lg">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="rounded-full border border-line bg-surface-raised px-6 py-3 text-sm font-semibold text-ink no-underline transition"
              >
                {t('hero.cta.contact')}
              </a>
              <a
                href="/#projects"
                className="group flex items-center gap-2 text-sm font-semibold text-ink-muted no-underline transition hover:text-ink"
              >
                {t('hero.cta.projects')}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Right column — 3D canvas */}
          <div className="flex items-center justify-center lg:h-[100dvh]">
            <HeroErrorBoundary>
              <Suspense fallback={<HeroCanvasFallback />}>
                <HeroCanvas />
              </Suspense>
            </HeroErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  )
}
