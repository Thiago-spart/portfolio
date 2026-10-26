import { formatMetric, type MetricValue } from '#/lib/metric'

interface Props {
  metric: MetricValue & { direction?: 'up' | 'down' | null }
  label: string
}

// The tile the timeline used for role highlights, now fed by case study
// results. `direction` (which way is better) is kept as data for styling and
// tests; the value itself already reads "before → after".
export default function MetricTile({ metric, label }: Props) {
  return (
    <div
      data-direction={metric.direction ?? undefined}
      className="rounded-xl border border-[rgba(0,170,255,0.3)] bg-[rgba(0,170,255,0.06)] p-3 text-center"
      style={{ boxShadow: '0 0 12px rgba(0,170,255,0.1) inset' }}
    >
      <p className="text-xl font-bold text-white">{formatMetric(metric)}</p>
      <p className="mt-0.5 text-[11px] text-muted-gray">{label}</p>
    </div>
  )
}
