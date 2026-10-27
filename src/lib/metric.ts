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

const MINUS = '−' // a real minus sign, not a hyphen

// The two values as displayed, for components that style them apart (the
// Metric primitive strikes through `before`). `before` is null for a
// single value.
export function formatMetricParts({ before, after, unit, qualifier }: MetricValue): {
  before: string | null
  after: string
} {
  const value = (n: number) => `${n < 0 ? MINUS : ''}${Math.abs(n)}${unit ?? ''}`
  let afterText = value(after)
  if (qualifier === 'change' && before == null && after > 0) afterText = `+${afterText}`
  if (qualifier === 'atLeast') afterText = `${afterText}+`
  return { before: before == null ? null : value(before), after: afterText }
}

export function formatMetric(metric: MetricValue): string {
  const { before, after } = formatMetricParts(metric)
  return before == null ? after : `${before} → ${after}`
}
