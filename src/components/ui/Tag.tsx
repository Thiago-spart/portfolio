import { cn } from '#/lib/utils'

interface TagProps {
  label: string
  // Core marks the main stack (React, React Native, TypeScript).
  core?: boolean
  // How many case studies use the tech (Stack section only).
  count?: number
  className?: string
}

// Figma: Components / Tag (9:45). One technology in a stack.
export function Tag({ label, core = false, count, className }: TagProps) {
  return (
    <span
      data-core={core || undefined}
      className={cn(
        'inline-flex h-[26px] shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border px-2 type-control-mono',
        core
          ? 'border-mangrove-soft bg-mangrove-soft text-mangrove'
          : 'border-line-strong text-ink',
        className,
      )}
    >
      {label}
      {count != null && <span className="text-ink-muted">{count}</span>}
    </span>
  )
}
