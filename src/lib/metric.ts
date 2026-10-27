// A case study result (sanity/schemas/objects/metric.ts), as projected by
// METRIC_FIELDS. Same text as the Studio preview: "40 → 95", "23% → 9%",
// "−96%", "95+", "+40%" — the unit is appended to both values.
export interface MetricValue {
  before?: number | null
  after: number
  unit?: string | null
  // "atLeast" adds a trailing "+"; "change" always shows the sign.
  qualifier?: 'atLeast' | 'change' | null
}

const MINUS = '\u2212' // a real minus sign, not a hyphen

export function formatMetric({ before, after, unit, qualifier }: MetricValue): string {
  const value = (n: number) => `${n < 0 ? MINUS : ''}${Math.abs(n)}${unit ?? ''}`
  let text = before == null ? value(after) : `${value(before)} → ${value(after)}`
  if (qualifier === 'change' && before == null && after > 0) text = `+${text}`
  if (qualifier === 'atLeast') text = `${text}+`
  return text
}
