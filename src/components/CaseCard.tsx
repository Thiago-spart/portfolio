import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from '#/i18n/useTranslation'
import { formatYearRange, isCoreTech, type CaseStudyRow } from '#/lib/caseStudy'
import { Metric } from './ui/Metric'
import { Tag } from './ui/Tag'
import type { Lang } from '#/i18n/LanguageContext'

const MAX_TAGS = 4
const MAX_METRICS = 2

interface CaseCardProps {
  caseStudy: CaseStudyRow
  lang: Lang
  // Puts the first metric in mango. Only the first card in the Work grid
  // gets it: mango once per view.
  accent?: boolean
}

// Figma: Components / Case card (10:173). Result first: role and years,
// title, the summary as one sentence of method, up to four Tags and two
// Metrics. The whole card is one link, named by its title. Hover draws the
// border in mangrove; focus uses the global ring.
export function CaseCard({ caseStudy, lang, accent = false }: CaseCardProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const summaryId = useId()
  const years = formatYearRange(caseStudy.startDate, caseStudy.endDate, t('work.present'))
  const role = caseStudy.roleTitle?.[lang]
  const summary = caseStudy.summary?.[lang]
  const tags = (caseStudy.stack ?? []).slice(0, MAX_TAGS)
  const results = (caseStudy.results ?? []).slice(0, MAX_METRICS)

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: caseStudy.slug }}
      aria-labelledby={titleId}
      aria-describedby={summary ? summaryId : undefined}
      className="flex h-full flex-col items-start gap-4 rounded-md border border-line bg-surface-raised p-6 text-ink no-underline transition-colors duration-150 ease-out hover:border-mangrove"
    >
      {(role || years) && (
        <div className="flex w-full items-baseline justify-between gap-4 text-ink-muted">
          <span className="type-label">{role}</span>
          <span className="shrink-0 whitespace-nowrap type-small">{years}</span>
        </div>
      )}
      <h3 id={titleId} className="m-0 type-title text-ink">
        {caseStudy.title[lang]}
      </h3>
      {summary && (
        <p id={summaryId} className="m-0 type-body text-ink-muted">
          {summary}
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tech) => (
            <Tag key={tech} label={tech} core={isCoreTech(tech)} />
          ))}
        </div>
      )}
      {results.length > 0 && (
        <div className="flex w-full items-end gap-6">
          {results.map((result, i) => (
            <Metric
              key={result._key}
              value={result}
              label={result.label[lang]}
              emphasis={accent && i === 0 ? 'accent' : 'plain'}
              className="flex-1"
            />
          ))}
        </div>
      )}
    </Link>
  )
}
