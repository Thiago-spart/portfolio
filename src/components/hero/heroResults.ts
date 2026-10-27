import type { HERO_RESULTS_QUERY_RESULT } from '#/types/sanity.generated'
import type { Lang } from '#/i18n/LanguageContext'
import { formatMetric, formatMetricParts, type MetricValue } from '#/lib/metric'

// Lighthouse score bands, each drawn with its glyph next to the number.
export type ScoreBand = 'good' | 'average' | 'poor'

export interface HeroResult {
  key: string
  label: string
  value: MetricValue
  before: string | null
  after: string
  // "40 → 95", for accessible names and plain text.
  text: string
  band: ScoreBand | null
  // How tall the proof shoot grows, 0–1 of the tallest shoot, spaced so no
  // two gauge marks overlap and leaders never cross (stackHeights).
  height: number
}

function scoreBand(score: number): ScoreBand {
  if (score >= 90) return 'good'
  if (score >= 50) return 'average'
  return 'poor'
}

// The shoot's height reads against the tide gauge: a score is its share of
// 100, a percentage change its size, a before → after its relative change.
function shootHeight({ before, after, unit }: MetricValue): number {
  let h: number
  if (before == null) h = Math.abs(after) / 100
  else if (unit == null && after <= 100) h = after / 100
  else h = Math.abs(after - before) / Math.max(Math.abs(before), Math.abs(after), 1)
  return Math.min(1, Math.max(0.15, h))
}

// The gauge reads a full shoot (height 1) as 2.2 m. The marks stack in the
// lane's order, top to bottom, so no two leaders cross: the first result
// takes the highest mark (the tallest height), and each next one sits at
// its own height or at least MIN_GAP_M under the previous mark, whichever
// is lower. Every mark stays between FLOOR (above the waterline) and 1.
const GAUGE_SPAN_M = 2.2
const MIN_GAP_M = 0.35
const FLOOR = 0.15

export function stackHeights(heights: number[], minGap = MIN_GAP_M / GAUGE_SPAN_M): number[] {
  if (heights.length === 0) return []
  const out = [...heights]
  out[0] = Math.min(1, Math.max(...heights))
  for (let i = 1; i < out.length; i++) out[i] = Math.min(heights[i], out[i - 1] - minGap)
  // Bottom up: nothing under the floor; push the stack up if needed.
  for (let i = out.length - 1; i >= 0; i--) {
    const below = i === out.length - 1 ? FLOOR - minGap : out[i + 1]
    out[i] = Math.min(1, Math.max(out[i], below + minGap))
  }
  return out.map((h) => Math.round(h * 1000) / 1000)
}

// The hero results from siteSettings.heroResults, in their Sanity order,
// localized. Rows whose metric no longer resolves are dropped.
export function toHeroResults(rows: HERO_RESULTS_QUERY_RESULT | undefined, lang: Lang): HeroResult[] {
  if (!rows) return []
  // The lane shows three; their marks are spaced on the gauge, the same in
  // the poster, the CSS leaders and the 3D scene.
  const results = rows.flatMap((row) => {
    const result = row.result
    if (!result) return []
    const value: MetricValue = {
      before: result.before,
      after: result.after,
      unit: result.unit,
      qualifier: result.qualifier,
    }
    const parts = formatMetricParts(value)
    // Only Lighthouse scores have bands (the label names the tool).
    const isScore = /lighthouse/i.test(result.label.en ?? '') && !result.unit
    return [
      {
        key: row._key,
        label: result.label[lang] ?? result.label.en ?? '',
        value,
        before: parts.before,
        after: parts.after,
        text: formatMetric(value),
        band: isScore ? scoreBand(result.after) : null,
        height: shootHeight(value),
      },
    ]
  }).slice(0, 3)
  const spaced = stackHeights(results.map((r) => r.height))
  return results.map((r, i) => ({ ...r, height: spaced[i] }))
}
