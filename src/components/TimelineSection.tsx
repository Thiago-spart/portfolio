// src/components/TimelineSection.tsx
import { useEffect, useRef } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import TimelineEntry from './TimelineEntry'
import type { SanityExperience, Lang } from '#/types/sanity'

interface Props {
  experiences: SanityExperience[]
  lang: Lang
}

function useGlitchRise(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = Array.from(el.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = children.indexOf(entry.target as HTMLElement)
            const target = entry.target as HTMLElement
            target.style.animationDelay = `${index * 80}ms`
            target.classList.remove('opacity-0')   // remove before adding animation to avoid fill-mode conflict
            target.classList.add('glitch-rise')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [ref])
}

export default function TimelineSection({ experiences, lang }: Props) {
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)
  useGlitchRise(listRef as React.RefObject<HTMLElement>)

  return (
    <section id="experience" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Section heading */}
        <h2 className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('timeline.title')}
        </h2>

        {/* Desktop: center spine + alternating; Mobile: left spine */}
        <div className="relative">
          {/* Spine */}
          <div
            className="absolute left-4 top-0 h-full w-px md:left-1/2"
            style={{ background: '#00aaff', boxShadow: '0 0 8px rgba(0,170,255,0.5)' }}
          />

          <div ref={listRef} className="flex flex-col gap-8 pl-10 md:pl-0">
            {experiences.map((entry, i) => (
              <div
                key={entry._id}
                className={`relative opacity-0 md:w-[calc(50%-2rem)] ${
                  i % 2 === 0 ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8'
                }`}
              >
                {/* Mobile: dot always on left */}
                <span
                  className="absolute -left-10 top-5 h-3 w-3 rounded-full bg-[#00aaff] md:hidden"
                  style={{ boxShadow: '0 0 8px rgba(0,170,255,0.8)' }}
                />
                {/* Desktop: dot on the spine side of this entry */}
                <span
                  className={`absolute top-5 hidden h-3 w-3 rounded-full bg-[#00aaff] md:block ${
                    i % 2 === 0 ? 'left-[-1.625rem]' : 'right-[-1.625rem]'
                  }`}
                  style={{ boxShadow: '0 0 8px rgba(0,170,255,0.8)' }}
                />
                <TimelineEntry entry={entry} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
