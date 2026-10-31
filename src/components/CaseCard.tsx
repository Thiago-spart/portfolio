import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { formatYearRange, isCoreTech, liveLabel, type CaseStudyRow } from '#/lib/caseStudy'
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
// title, then two Metrics before the summary (one sentence of method), up
// to four Tags and, when the product is live, a link to it. The title is the link and its ::after stretches over the card, so
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
  const live = caseStudy.liveUrl ? liveLabel(caseStudy.liveUrl) : null

  return (
    <article className="relative flex h-full flex-col items-start gap-4 rounded-md border border-line bg-surface-raised p-6 text-ink transition-colors duration-150 ease-out has-[h3_a:hover]:border-mangrove has-[h3_a:focus-visible]:focus-ring">
      {(role || years) && (
        <div className="flex w-full items-baseline justify-between gap-4 text-ink-muted">
          <span className="type-label">{role}</span>
          <span className="shrink-0 whitespace-nowrap type-code">{years}</span>
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
      {results.length > 0 && (
        // case-tide: the tide line uncovers each before value as the card
        // scrolls in (motion.css); the after value is always shown.
        <div className="case-tide flex w-full flex-wrap items-end gap-x-6 gap-y-4">
          {results.map((result, i) => (
            <Metric
              key={result._key}
              value={result}
              label={result.label[lang]}
              emphasis={accent && i === 0 ? 'accent' : 'plain'}
              // Content-sized, so two wide values wrap instead of colliding.
              className="flex-[1_1_auto]"
            />
          ))}
        </div>
      )}
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
      {live && (
        // Above the card's stretched link, so it opens the product itself.
        <a
          href={caseStudy.liveUrl!}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 mt-auto -mb-1 inline-flex min-h-6 items-center gap-1.5 rounded-sm type-code text-ink-muted underline-offset-4 hover:text-mangrove hover:underline"
        >
          <ExternalLink aria-hidden="true" size={14} strokeWidth={1.5} />
          {t('work.live').replace('{site}', live)}
          {' '}
          <span className="sr-only">{t('contact.newTab')}</span>
        </a>
      )}
    </article>
  )
}
