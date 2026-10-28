import { cn } from '#/lib/utils'

interface CalloutProps {
  label: string
  // Numbered when given (prop root ①, canopy ②); plain otherwise.
  number?: number | string
  className?: string
}

// Figma: Components / Callout (10:57). An annotation on the hero drawing,
// on a 90% ground plate so it stays legible over lines.
export function Callout({ label, number, className }: CalloutProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 bg-ground/90 px-1 py-0.5 text-ink-muted',
        className,
      )}
    >
      {number != null && (
        <span
          aria-hidden="true"
          className="inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink-muted font-mono text-[11px] leading-4 font-medium tracking-[0.06em]"
        >
          {number}
        </span>
      )}
      <span className="whitespace-nowrap type-label">{label}</span>
    </span>
  )
}
