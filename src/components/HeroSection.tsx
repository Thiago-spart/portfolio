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
      <div className="hero-section-bg flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[55fr_45fr] lg:px-12">
          {/* Left column */}
          <div className="flex flex-col justify-center gap-6">
            {/* Badge */}
            <div className="flex items-center gap-2 self-start rounded-full border border-[rgba(0,170,255,0.4)] bg-[rgba(5,5,8,0.8)] px-4 py-1.5">
              <span className="pulse-dot h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold tracking-widest text-[rgba(255,255,255,0.85)] uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Bebas_Neue'] text-[clamp(3rem,7vw,6rem)] leading-none tracking-wider text-white">
              <span className="block">{t('hero.headline.line1')}</span>
              <span
                className="block"
                style={{ textShadow: '0 0 40px rgba(0,170,255,0.4)' }}
              >
                {t('hero.headline.line2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[480px] text-base text-[rgba(255,255,255,0.7)] sm:text-lg">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="glitch-flicker rounded-full border border-[#00aaff] bg-[rgba(5,5,8,0.9)] px-6 py-3 text-sm font-semibold text-[#c8f0ff] no-underline transition"
                style={{ boxShadow: '0 0 12px rgba(0,170,255,0.35)' }}
              >
                {t('hero.cta.contact')}
              </a>
              <a
                href="/#projects"
                className="group flex items-center gap-2 text-sm font-semibold text-[rgba(255,255,255,0.6)] no-underline transition hover:text-white"
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
