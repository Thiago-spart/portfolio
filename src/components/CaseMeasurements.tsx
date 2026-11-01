import { useTranslation } from '#/i18n/useTranslation'
import { formatMeasuredWhen } from '#/lib/caseStudy'
import { formatMetric } from '#/lib/metric'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDY_DETAIL_QUERY_RESULT } from '#/types/sanity.generated'

type Result = NonNullable<NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>['results']>[number]
export type MeasuredResult = Result & { measurement: NonNullable<Result['measurement']> }

/** The results that say how they were measured, in strip order. */
export function measuredResults(results: readonly Result[]): MeasuredResult[] {
  return results.filter((result): result is MeasuredResult => !!result.measurement?.method)
}

export const resultAnchor = (key: string) => `result-${key}`
export const metricAnchor = (key: string) => `metric-${key}`

interface CaseMeasurementsProps {
  results: readonly MeasuredResult[]
  lang: Lang
}

// The Measurement part of a case study (#67, #73): one row per result that
// says how it was measured, numbered like its footnote in the results strip.
// The number and label as published, then the method, then tool · when ·
// source, and a link back up to the number.
export function CaseMeasurements({ results, lang }: CaseMeasurementsProps) {
  const { t } = useTranslation()

  return (
    <ol className="m-0 flex list-none flex-col gap-6 p-0">
      {results.map((result, i) => {
        const { tool, from, to, source, method } = result.measurement
        const meta = [tool, formatMeasuredWhen(from, to, lang)].filter(Boolean).join(' · ')
        return (
          <li key={result._key} id={resultAnchor(result._key)} className="flex scroll-mt-16 gap-3">
            <span aria-hidden="true" className="type-code text-mangrove">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="m-0 type-label text-ink-muted">
                <span className="type-code normal-case text-ink">{formatMetric(result)}</span> · {result.label[lang]}
              </p>
              <p className="m-0 type-body text-ink">{method[lang]}</p>
              <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 type-small text-ink-muted">
                {meta && <span>{meta}</span>}
                {source && (
                  <a href={source} target="_blank" rel="noreferrer" className="text-mangrove underline underline-offset-2">
                    {t('caseStudy.measurementSource')}
                  </a>
                )}
                <a
                  href={`#${metricAnchor(result._key)}`}
                  aria-label={t('caseStudy.backToResult').replace('{label}', result.label[lang])}
                  className="rounded-sm text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:focus-ring"
                >
                  ↑ {t('caseStudy.backToResultShort')}
                </a>
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
