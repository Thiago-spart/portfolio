import { formatMetricParts, type MetricValue } from '#/lib/metric'
import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'

interface MetricProps {
  value: MetricValue
  label: string
  description?: string
  // Accent sets the after value in mango: once per view. Plain elsewhere.
  emphasis?: 'accent' | 'plain'
  className?: string
}

// Figma: Components / Metric (10:82). Delta (a before value: struck and
// muted, then → after) or Single (after only), Accent or Plain.
export function Metric({ value, label, description, emphasis = 'plain', className }: MetricProps) {
  const { t } = useTranslation()
  const { before, after } = formatMetricParts(value)

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-2', className)}>
      <p className="m-0 type-label text-ink-muted">{label}</p>
      <p className="m-0 flex items-baseline gap-3 whitespace-nowrap">
        {before != null && (
          <span className="metric-before flex items-baseline gap-3">
            <s className="type-metric-s text-ink-muted decoration-1">{before}</s>
            <span aria-hidden="true" className="font-mono text-[20px] leading-7 font-medium tracking-[-0.02em] text-ink-muted">
              →
            </span>
            <span className="sr-only">{` ${t('metric.to')} `}</span>
          </span>
        )}
        <span
          data-emphasis={emphasis}
          className={cn('metric-after type-metric', emphasis === 'accent' ? 'text-mango' : 'text-ink')}
        >
          {after}
        </span>
      </p>
      {description && <p className="m-0 type-small text-ink-muted">{description}</p>}
    </div>
  )
}
