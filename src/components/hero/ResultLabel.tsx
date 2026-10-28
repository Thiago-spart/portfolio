import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'
import type { HeroResult, ScoreBand } from './heroResults'

const BAND_COLOR: Record<ScoreBand, string> = {
  good: 'fill-score-good',
  average: 'fill-score-average',
  poor: 'fill-score-poor',
}

// Lighthouse band glyphs: ● good, ■ average, ▲ poor.
function BandGlyph({ band }: { band: ScoreBand }) {
  return (
    <svg aria-hidden="true" focusable="false" width={12} height={12} viewBox="0 0 12 12" className="shrink-0">
      {band === 'good' && <circle cx="6" cy="6" r="5" className={BAND_COLOR[band]} />}
      {band === 'average' && <rect x="1" y="1" width="10" height="10" className={BAND_COLOR[band]} />}
      {band === 'poor' && <path d="M6 1 11 11H1Z" className={BAND_COLOR[band]} />}
    </svg>
  )
}

// The value line: the muted before value, an arrow, the band glyph (scores
// only) and the after value.
export function ResultValue({ result }: { result: HeroResult }) {
  const { t } = useTranslation()
  return (
    <span className="flex items-center gap-2 whitespace-nowrap type-metric-s">
      {result.before != null && (
        <>
          <span className="text-ink-muted">{result.before}</span>
          <span aria-hidden="true" className="text-ink-muted">
            →
          </span>
          <span className="sr-only">{` ${t('metric.to')} `}</span>
        </>
      )}
      {result.band && <BandGlyph band={result.band} />}
      <span className="text-ink">{result.after}</span>
    </span>
  )
}

// Figma: Components / Result label (10:50), Plain emphasis: the mango is the
// one accent in the hero.
export function ResultLabel({ result, className }: { result: HeroResult; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-1 rounded-sm border border-line bg-surface-raised p-3', className)}>
      <p className="m-0 type-label text-ink-muted">{result.label}</p>
      <p className="m-0">
        <ResultValue result={result} />
      </p>
    </div>
  )
}
