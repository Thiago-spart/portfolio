// src/components/TimelineEntry.tsx
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from '#/i18n/useTranslation'
import { formatDateRange } from '#/lib/formatDate'
import MetricTile from './MetricTile'
import type { Lang } from '#/i18n/LanguageContext'
import type { ROLES_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  entry: ROLES_QUERY_RESULT[number]
  lang: Lang
}

export default function TimelineEntry({ entry, lang }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  // Role highlights moved to case study results: the expanded panel shows
  // the results of this role's case studies.
  const results = entry.caseStudies.flatMap((study) =>
    (study.results ?? []).map((result) => ({ ...result, key: `${study._id}-${result._key}` })),
  )
  const expandable = results.length > 0

  const summary = (
    <>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-mangrove">
            {formatDateRange(entry.startDate, entry.endDate, t('timeline.present'))}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-ink">{entry.company}</h3>
          <p className="text-sm text-mangrove">{entry.title[lang]}</p>
        </div>
        {expandable && (
          <span aria-hidden="true" className="mt-1 text-ink-muted transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            ▾
          </span>
        )}
      </div>

      {/* Summary */}
      {entry.summary?.[lang] && (
        <p className="mt-3 text-sm text-ink-muted">{entry.summary[lang]}</p>
      )}

      {/* Tech stack */}
      {entry.stack && entry.stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line bg-surface-raised px-2.5 py-0.5 text-[11px] text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div
      className="w-full rounded-2xl border border-line bg-surface-raised p-5 text-left transition hover:border-line"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      {expandable ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="block w-full text-left"
        >
          {summary}
        </button>
      ) : (
        summary
      )}

      {/* Case studies from this role (links can't live inside the toggle button) */}
      {entry.caseStudies.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {entry.caseStudies.map((study) => (
            <li key={study._id}>
              <Link
                to="/projects/$slug"
                params={{ slug: study.slug }}
                className="text-xs font-semibold text-mangrove hover:underline"
              >
                <span aria-hidden="true">→ </span>
                {study.title[lang]}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Results — expanded */}
      {open && expandable && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
          {results.map((result) => (
            <MetricTile key={result.key} metric={result} label={result.label[lang]} />
          ))}
        </div>
      )}
    </div>
  )
}
