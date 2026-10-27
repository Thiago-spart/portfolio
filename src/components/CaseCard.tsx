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
// Metrics. The title is the link and its ::after stretches over the card, so
// the whole card is clickable while the link's name stays its visible text
// (WCAG 2.5.3). Hover draws the border in mangrove; the card carries the
// focus ring while the link is focused.
export function CaseCard({ caseStudy, lang, accent = false }: CaseCardProps) {
  const { t } = useTranslation()
  const summaryId = useId()
  const years = formatYearRange(caseStudy.startDate, caseStudy.endDate, t('work.present'))
  const role = caseStudy.roleTitle?.[lang]
  const summary = caseStudy.summary?.[lang]
  const tags = (caseStudy.stack ?? []).slice(0, MAX_TAGS)
  const results = (caseStudy.results ?? []).slice(0, MAX_METRICS)

  return (
    <article className="relative flex h-full flex-col items-start gap-4 rounded-md border border-line bg-surface-raised p-6 text-ink transition-colors duration-150 ease-out has-[a:hover]:border-mangrove has-[a:focus-visible]:focus-ring">
      {(role || years) && (
        <div className="flex w-full items-baseline justify-between gap-4 text-ink-muted">
          <span className="type-label">{role}</span>
          <span className="shrink-0 whitespace-nowrap type-small">{years}</span>
        </div>
      )}
      <h3 className="m-0 type-title text-ink">
        <Link
          to="/projects/$slug"
          params={{ slug: caseStudy.slug }}
          aria-describedby={summary ? summaryId : undefined}
          className="text-ink no-underline outline-none after:absolute after:inset-0 after:rounded-md after:content-['']"
        >
          {caseStudy.title[lang]}
        </Link>
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
    </article>
  )
}
