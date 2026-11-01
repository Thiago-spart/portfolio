import { useTranslation } from '#/i18n/useTranslation'
import { formatMeasuredWhen } from '#/lib/caseStudy'
import { formatMetric } from '#/lib/metric'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDY_DETAIL_QUERY_RESULT } from '#/types/sanity.generated'

type Result = NonNullable<NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>['results']>[number]
type MeasuredResult = Result & { measurement: NonNullable<Result['measurement']> }

/** Results measured the same way, word for word, shown as one row. */
export interface MeasurementGroup {
  // The first result's key: the row's anchor.
  key: string
  results: MeasuredResult[]
  measurement: MeasuredResult['measurement']
}

/**
 * The results that say how they were measured, grouped by identical
 * measurement (one Lighthouse run behind five numbers is one row), in the
 * order each group's first result appears in the strip.
 */
export function measurementGroups(results: readonly Result[]): MeasurementGroup[] {
  const groups = new Map<string, MeasurementGroup>()
  for (const result of results) {
    if (!result.measurement?.method) continue
    const { method, tool, from, to, source } = result.measurement
    const id = JSON.stringify([method.en, method.pt, method.es, tool, from, to, source])
    const group = groups.get(id)
    if (group) group.results.push(result as MeasuredResult)
    else groups.set(id, { key: result._key, results: [result as MeasuredResult], measurement: result.measurement })
  }
  return [...groups.values()]
}

export const resultAnchor = (key: string) => `result-${key}`
export const metricAnchor = (key: string) => `metric-${key}`

interface CaseMeasurementsProps {
  groups: readonly MeasurementGroup[]
  lang: Lang
}

// The Measurement part of a case study (#67, #73): one row per way of
// measuring, numbered like the footnotes in the results strip. The numbers
// and labels as published, then the method, then tool · when · source, and
// a link back up to the (first) number.
export function CaseMeasurements({ groups, lang }: CaseMeasurementsProps) {
  const { t } = useTranslation()

  return (
    <ol className="m-0 flex list-none flex-col gap-6 p-0">
      {groups.map((group, i) => {
        const { tool, from, to, source, method } = group.measurement
        const meta = [tool, formatMeasuredWhen(from, to, lang)].filter(Boolean).join(' · ')
        const first = group.results[0]
        return (
          <li key={group.key} id={resultAnchor(group.key)} className="flex scroll-mt-16 gap-3">
            <span aria-hidden="true" className="type-code text-mangrove">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <ul className="m-0 flex list-none flex-col p-0">
                {group.results.map((result) => (
                  <li key={result._key} className="type-label text-ink-muted">
                    <span className="type-code normal-case text-ink">{formatMetric(result)}</span> · {result.label[lang]}
                  </li>
                ))}
              </ul>
              <p className="m-0 type-body text-ink">{method[lang]}</p>
              <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 type-small text-ink-muted">
                {meta && <span>{meta}</span>}
                {source && (
                  <a href={source} target="_blank" rel="noreferrer" className="text-mangrove underline underline-offset-2">
                    {t('caseStudy.measurementSource')}
                  </a>
                )}
                <a
                  href={`#${metricAnchor(first._key)}`}
                  aria-label={t('caseStudy.backToResult').replace('{label}', first.label[lang])}
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
