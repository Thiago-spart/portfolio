// A case study result (sanity/schemas/objects/metric.ts), as projected by
// METRIC_FIELDS. Same text as the Studio preview: "40 → 95", "23% → 9%",
// "-96%" — the unit is appended to both values.
export interface MetricValue {
  before?: number | null
  after: number
  unit?: string | null
}

export function formatMetric({ before, after, unit }: MetricValue): string {
  const value = (n: number) => `${n}${unit ?? ''}`
  return before == null ? value(after) : `${value(before)} → ${value(after)}`
}
