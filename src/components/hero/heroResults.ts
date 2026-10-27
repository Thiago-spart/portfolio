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
  // two gauge marks overlap (spaceHeights).
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

// The gauge reads a full shoot (height 1) as 2.2 m. Marks closer than
// MIN_GAP_M would draw as one line, so the lower one moves down; order by
// height is kept and every mark stays between FLOOR and 1.
const GAUGE_SPAN_M = 2.2
const MIN_GAP_M = 0.35
const FLOOR = 0.15

export function spaceHeights(heights: number[], minGap = MIN_GAP_M / GAUGE_SPAN_M): number[] {
  const order = heights.map((h, i) => ({ h, i })).sort((a, b) => b.h - a.h || a.i - b.i)
  const out = [...heights]
  // Top down: each mark at least minGap under the one above it.
  order.forEach(({ h, i }, k) => {
    out[i] = k === 0 ? Math.min(1, h) : Math.min(h, out[order[k - 1].i] - minGap)
  })
  // Bottom up: nothing under the floor; push the stack up if needed.
  for (let k = order.length - 1; k >= 0; k--) {
    const i = order[k].i
    const below = k === order.length - 1 ? FLOOR - minGap : out[order[k + 1].i]
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
  const spaced = spaceHeights(results.map((r) => r.height))
  return results.map((r, i) => ({ ...r, height: spaced[i] }))
}
