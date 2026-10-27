// src/components/TimelineSection.tsx
import { useTranslation } from '#/i18n/useTranslation'
import TimelineEntry from './TimelineEntry'
import type { Lang } from '#/i18n/LanguageContext'
import type { ROLES_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  roles: ROLES_QUERY_RESULT
  lang: Lang
}

export default function TimelineSection({ roles, lang }: Props) {
  const { t } = useTranslation()

  return (
    <section id="experience" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Section heading */}
        <h2 className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-mangrove">
          {t('timeline.title')}
        </h2>

        {/* Desktop: center spine + alternating; Mobile: left spine */}
        <div className="relative">
          {/* Spine */}
          <div
            className="absolute left-4 top-0 h-full w-px md:left-1/2"
            style={{ background: 'var(--mangrove)' }}
          />

          <div className="flex flex-col gap-8 pl-10 md:pl-0">
            {roles.map((entry, i) => (
              <div
                key={entry._id}
                className={`relative md:w-[calc(50%-2rem)] ${
                  i % 2 === 0 ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8'
                }`}
              >
                {/* Mobile: dot always on left */}
                <span
                  className="absolute -left-10 top-5 h-3 w-3 rounded-full bg-mangrove md:hidden"
                />
                {/* Desktop: dot on the spine side of this entry */}
                <span
                  className={`absolute top-5 hidden h-3 w-3 rounded-full bg-mangrove md:block ${
                    i % 2 === 0 ? 'left-[-1.625rem]' : 'right-[-1.625rem]'
                  }`}
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
