import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { formatResultPhrase, startYear, type CaseStudyRow } from '#/lib/caseStudy'
import { cn } from '#/lib/utils'
import type { Lang } from '#/i18n/LanguageContext'

interface ArchiveRowProps {
  caseStudy: CaseStudyRow
  lang: Lang
}

// Figma: Components / Archive row (29:350). One case study in "More work"
// (and "Next case study"). Wide from 640px: year, title, two techs, the
// headline result, arrow. Compact below: year and techs, then title and
// arrow, then the result. The result column keeps its width when there is
// no result, so the rows stay aligned. The whole row is one link, named by
// its title. Hover: sunken surface, title and arrow in mangrove.
export function ArchiveRow({ caseStudy, lang }: ArchiveRowProps) {
  const titleId = useId()
  const contextId = useId()
  const resultId = useId()
  const year = startYear(caseStudy.startDate)
  const context = (caseStudy.stack ?? []).slice(0, 2).join(' · ')
  const headline = caseStudy.results?.[0]
  const result = headline ? formatResultPhrase(headline, lang) : ''

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: caseStudy.slug }}
      aria-labelledby={titleId}
      aria-describedby={result ? `${contextId} ${resultId}` : contextId}
      className={cn(
        'group grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-2 border-b border-line px-3 py-4 text-ink no-underline',
        'transition-colors duration-150 ease-out hover:bg-surface-sunken focus-visible:rounded-sm',
        'sm:grid-cols-[--spacing(14)_1fr_--spacing(40)_--spacing(40)_auto] sm:gap-x-6',
        'lg:grid-cols-[--spacing(14)_1fr_--spacing(60)_--spacing(60)_auto]',
      )}
    >
      <span className="col-start-1 row-start-1 type-code text-ink-muted">{year}</span>
      <span
        id={titleId}
        className="col-span-2 col-start-1 row-start-2 type-body-strong text-ink group-hover:text-mangrove sm:col-span-1 sm:col-start-2 sm:row-start-1"
      >
        {caseStudy.title[lang]}
      </span>
      <span
        id={contextId}
        className="col-span-2 col-start-2 row-start-1 type-small text-ink-muted sm:col-span-1 sm:col-start-3"
      >
        {context}
      </span>
      <span
        id={resultId}
        className={cn(
          'col-span-3 col-start-1 row-start-3 type-code text-ink sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:text-right',
          !result && 'max-sm:hidden',
        )}
      >
        {result}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        size={18}
        strokeWidth={1.5}
        className="col-start-3 row-start-2 justify-self-end text-ink group-hover:text-mangrove sm:col-start-5 sm:row-start-1"
      />
    </Link>
  )
}
