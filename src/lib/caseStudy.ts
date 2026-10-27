import { formatMetric } from '#/lib/metric'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDIES_QUERY_RESULT } from '#/types/sanity.generated'

export type CaseStudyRow = CASE_STUDIES_QUERY_RESULT[number]
type Result = NonNullable<CaseStudyRow['results']>[number]

// The main stack, drawn as Core tags (Figma: Components / Tag).
const CORE_TECH = new Set(['React', 'React Native', 'TypeScript'])

export function isCoreTech(name: string): boolean {
  return CORE_TECH.has(name)
}

const EN_DASH = '–'

function yearOf(date: string | null | undefined): string | null {
  return date ? date.slice(0, 4) : null
}

/** The start year of a case study ("2024"), or "" without a start date. */
export function startYear(startDate: string | null | undefined): string {
  return yearOf(startDate) ?? ''
}

/** "2023–2025"; "2025" when it starts and ends in the same year; "2025–Present" while ongoing. */
export function formatYearRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  presentLabel: string,
): string {
  const start = yearOf(startDate)
  if (!start) return ''
  const end = yearOf(endDate)
  if (end === start) return start
  return `${start}${EN_DASH}${end ?? presentLabel}`
}

/** "Feb 2023 – Jan 2025" in the reader's language; "" without a start date. */
export function formatMonthRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  presentLabel: string,
  lang: Lang,
): string {
  if (!startDate) return ''
  // Build a local date from the parts: `new Date('YYYY-MM-DD')` is UTC
  // midnight and shows the previous month west of Greenwich.
  const month = (date: string) => {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(lang, { month: 'short', year: 'numeric' })
  }
  return `${month(startDate)} ${EN_DASH} ${endDate ? month(endDate) : presentLabel}`
}

// Words that stay capitalized at the start of a result label.
const PROPER_LEADS = new Set(['Lighthouse'])

/**
 * A result as one phrase for the archive row: "90% test coverage",
 * "95+ Lighthouse", "3.5 → 4.8 App Store rating". The label reads in
 * sentence case after the number, so its capital is dropped unless the
 * label looks like a name (a known proper noun, or more capitals after).
 */
export function formatResultPhrase(result: Result, lang: Lang): string {
  const label = result.label[lang]
  const [lead = '', ...rest] = label.split(' ')
  const keepsCapital = PROPER_LEADS.has(lead) || rest.some((word) => /^\p{Lu}/u.test(word)) || /\p{Lu}/u.test(lead.slice(1))
  const phrase = keepsCapital ? label : label.charAt(0).toLocaleLowerCase(lang) + label.slice(1)
  return `${formatMetric(result)} ${phrase}`
}

/** The case study after `slug` in reading order (featured by order, then the archive), wrapping around. */
export function nextCaseStudy(rows: CASE_STUDIES_QUERY_RESULT, slug: string): CaseStudyRow | null {
  const index = rows.findIndex((row) => row.slug === slug)
  if (index === -1 || rows.length < 2) return null
  return rows[(index + 1) % rows.length]
}
