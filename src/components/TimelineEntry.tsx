import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Tag } from '#/components/ui/Tag'
import { useTranslation } from '#/i18n/useTranslation'
import { formatRoleDates } from '#/lib/formatDate'
import { cn } from '#/lib/utils'
import type { Lang } from '#/i18n/LanguageContext'
import type { ROLES_QUERY_RESULT } from '#/types/sanity.generated'

type Role = ROLES_QUERY_RESULT[number]

interface Props {
  entry: Role
  lang: Lang
  // The last role ends the rail line.
  last?: boolean
  // Older roles keep one line (title, company, dates); the rest opens on demand.
  compact?: boolean
}

// Figma: Components / Role entry (33:481) caps both lists.
const MAX_CASE_LINKS = 4
const MAX_TAGS = 6

// Figma: Components / Case link (33:320). Mangrove label after an arrow;
// hover darkens the label and underlines it with a bottom border.
function CaseLink({ study, lang }: { study: Role['caseStudies'][number]; lang: Lang }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: study.slug }}
      className="group inline-flex max-w-full items-start gap-2 py-1 type-body text-mangrove no-underline"
    >
      <span aria-hidden="true" className="flex h-lh w-4 shrink-0 items-center justify-center">
        <ArrowRight size={16} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 border-b border-transparent transition-colors duration-150 ease-out group-hover:border-mangrove group-hover:text-mangrove-hover">
        {study.title[lang]}
      </span>
    </Link>
  )
}

// A native disclosure styled like a case link: mangrove text after a chevron
// that turns when open. Works before hydration and opens for find-in-page.
function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="group/disclosure">
      <summary className="inline-flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 type-body text-mangrove transition-colors duration-150 ease-out hover:text-mangrove-hover [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          size={16}
          strokeWidth={1.5}
          className="transition-transform duration-150 ease-out group-open/disclosure:rotate-90 motion-reduce:transition-none"
        />
        {label}
      </summary>
      <div className="flex flex-col gap-4 pt-2">{children}</div>
    </details>
  )
}

// One role on the Experience rail. Wide (640+): dates right-aligned in a
// 160 column, then the rail, then the content. Compact: rail first, dates
// above the title. The ongoing role (no end date) gets the filled marker.
export default function TimelineEntry({ entry, lang, last = false, compact = false }: Props) {
  const { t } = useTranslation()
  const current = !entry.endDate
  const summary = entry.summary?.[lang]
  const caseStudies = entry.caseStudies.slice(0, MAX_CASE_LINKS)
  const stack = (entry.stack ?? []).slice(0, MAX_TAGS)
  const caseCount = (
    caseStudies.length === 1 ? t('experience.caseCountOne') : t('experience.caseCount')
  ).replace('{count}', String(caseStudies.length))

  const caseList = (
    <ul aria-label={t('experience.caseStudies')} className="m-0 flex list-none flex-col gap-1 p-0">
      {caseStudies.map((study) => (
        <li key={study._id} className="flex">
          <CaseLink study={study} lang={lang} />
        </li>
      ))}
    </ul>
  )

  // Everything under the title. A full entry shows it with the case links
  // behind a count (they repeat the Projects section); a compact one puts
  // all of it behind "Details".
  const details = [
    summary && (
      <p key="summary" className="m-0 max-w-180 type-body text-ink-muted">
        {summary}
      </p>
    ),
    caseStudies.length > 0 &&
      (compact ? (
        <Fragment key="cases">{caseList}</Fragment>
      ) : (
        <Disclosure key="cases" label={caseCount}>
          {caseList}
        </Disclosure>
      )),
    stack.length > 0 && (
      <ul key="stack" aria-label={t('experience.stack')} className="m-0 flex list-none flex-wrap gap-2 p-0">
        {stack.map((tech) => (
          <li key={tech} className="flex">
            <Tag label={tech} />
          </li>
        ))}
      </ul>
    ),
  ].filter(Boolean)

  return (
    <article
      data-current={current || undefined}
      className="grid grid-cols-[--spacing(4)_minmax(0,1fr)] gap-x-4 gap-y-4 sm:grid-cols-[--spacing(40)_--spacing(4)_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-0"
    >
      <p
        className={cn(
          'col-start-2 row-start-1 m-0 type-code sm:col-start-1 sm:text-right',
          current ? 'text-ink' : 'text-ink-muted',
        )}
      >
        {formatRoleDates(entry.startDate, entry.endDate, lang, t('experience.now'))}
      </p>

      <div
        aria-hidden="true"
        data-testid="rail"
        className="col-start-1 row-span-2 row-start-1 flex flex-col items-center gap-1 pt-1 sm:col-start-2 sm:row-span-1"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" className="shrink-0">
          <circle
            data-testid="marker"
            cx="5.5"
            cy="5.5"
            r="4.75"
            strokeWidth="1.5"
            className={cn('stroke-mangrove', current ? 'fill-mangrove' : 'fill-ground')}
          />
        </svg>
        {!last && <span data-testid="rail-line" className="w-px flex-1 bg-line-strong" />}
      </div>

      <div
        className={cn(
          'col-start-2 flex min-w-0 flex-col sm:col-start-3 sm:row-start-1',
          compact ? 'gap-2 pb-6 sm:pb-8' : 'gap-4 pb-8 sm:pb-12',
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="m-0 type-title text-ink">{entry.title[lang]}</h3>
          <p className="m-0 type-label text-ink-muted">{entry.company}</p>
        </div>

        {compact ? (
          details.length > 0 && <Disclosure label={t('experience.details')}>{details}</Disclosure>
        ) : (
          details
        )}
      </div>
    </article>
  )
}
