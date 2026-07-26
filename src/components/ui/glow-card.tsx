// Pointer-tracking spotlight card. Static [data-glow] pseudo-element rules
// live in src/styles.css; this handles pointer sync + the design-tokened
// per-instance CSS custom properties (design.md §3 palette, §7 Cards spec).
import { useEffect, useRef } from 'react'
import type { AnchorHTMLAttributes, CSSProperties, ReactNode, RefObject } from 'react'

export type GlowColor = 'blue' | 'purple' | 'ember'

interface GlowCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'color'> {
  children: ReactNode
  className?: string
  glowColor?: GlowColor
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean
  href?: string
}

// Hues matched to design.md §3: electric-blue #00aaff (200°), neon-purple
// #7b2fff (262°), ember #ff6a00 (25°). Spread is kept tight (not the 200-300°
// sweep of the original) so the pointer-driven hue shift stays inside the
// brand's own accent family instead of drifting into green/yellow.
const glowColorMap: Record<GlowColor, { base: number; spread: number }> = {
  blue: { base: 200, spread: 30 },
  purple: { base: 262, spread: 30 },
  ember: { base: 25, spread: 30 },
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  href,
  ...anchorProps
}: GlowCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e
      const el = cardRef.current
      if (el) {
        el.style.setProperty('--x', x.toFixed(2))
        el.style.setProperty('--xp', (x / window.innerWidth).toFixed(2))
        el.style.setProperty('--y', y.toFixed(2))
        el.style.setProperty('--yp', (y / window.innerHeight).toFixed(2))
      }
    }

    document.addEventListener('pointermove', syncPointer)
    return () => document.removeEventListener('pointermove', syncPointer)
  }, [])

  const { base, spread } = glowColorMap[glowColor]

  const style: CSSProperties & Record<string, string | number> = {
    '--base': base,
    '--spread': spread,
    '--radius': '16',
    '--border': '2',
    '--backdrop': 'rgba(8,13,26,0.85)',
    '--backup-border': 'rgba(0,170,255,0.3)',
    '--size': '220',
    '--outer': '1',
    '--border-size': 'calc(var(--border, 2) * 1px)',
    '--spotlight-size': 'calc(var(--size, 150) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 200) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
    )`,
    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  }

  const sharedClassName = `
    ${customSize ? '' : `${sizeMap[size]} aspect-[3/4]`}
    rounded-2xl
    relative
    shadow-[0_1rem_2rem_-1rem_black]
    backdrop-blur-[5px]
    transition
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[var(--electric-blue)]
    ${className}
  `

  if (href) {
    return (
      <a
        ref={cardRef as RefObject<HTMLAnchorElement>}
        href={href}
        data-glow
        style={style}
        className={sharedClassName}
        {...anchorProps}
      >
        <div data-glow aria-hidden="true" />
        {children}
      </a>
    )
  }

  return (
    <div
      ref={cardRef as RefObject<HTMLDivElement>}
      data-glow
      style={style}
      className={sharedClassName}
    >
      <div data-glow aria-hidden="true" />
      {children}
    </div>
  )
}
