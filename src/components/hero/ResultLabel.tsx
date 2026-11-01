import { useId, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { caseAnchor, goTo } from '#/lib/inPage'
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
function ResultValue({ result }: { result: HeroResult }) {
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
// one accent in the hero. The product names where the number comes from and
// links to its case study; its ::after covers the label, so the whole label
// is clickable while the link's name stays its visible text (WCAG 2.5.3),
// with the metric as its description. Hover: sunken surface, product and
// arrow in mangrove, as on the archive rows.
//
// On the home page a click leads to the result's Case card in Work (goTo
// scrolls there, marks it and moves focus to its link); the case page is
// one more click, from the card. The href stays the case page, so without
// script, with a modified click (new tab) or where no card is on the page,
// it is an ordinary link.
//
// Hover or focus marks the label's shoot and dimension line in the drawing
// (onActive), and `active` marks the label when its shoot is hovered.
interface ResultLabelProps {
  result: HeroResult
  className?: string
  active?: boolean
  onActive?: (on: boolean) => void
}

export function ResultLabel({ result, className, active = false, onActive }: ResultLabelProps) {
  const metricId = useId()
  const toCard = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (goTo(caseAnchor(result.slug))) e.preventDefault()
  }
  return (
    <div
      data-result-label=""
      data-active={active || undefined}
      onPointerEnter={() => onActive?.(true)}
      onPointerLeave={() => onActive?.(false)}
      onFocus={() => onActive?.(true)}
      onBlur={() => onActive?.(false)}
      className={cn(
        'group relative flex flex-col items-start gap-1 rounded-sm border border-line bg-surface-raised p-3',
        'transition-colors duration-150 ease-out hover:bg-surface-sunken data-active:bg-surface-sunken has-[a:focus-visible]:focus-ring',
        className,
      )}
    >
      <Link
        to="/projects/$slug"
        params={{ slug: result.slug }}
        aria-describedby={metricId}
        onClick={toCard}
        className="flex items-center gap-1 type-label text-ink no-underline outline-none group-hover:text-mangrove group-data-active:text-mangrove after:absolute after:inset-0 after:content-['']"
      >
        {result.product}
        <ArrowRight aria-hidden="true" size={14} strokeWidth={1.5} className="shrink-0" />
      </Link>
      <p id={metricId} className="m-0 flex flex-col items-start gap-1">
        <span className="type-label text-ink-muted">{result.label}</span>{' '}
        <ResultValue result={result} />
      </p>
    </div>
  )
}
