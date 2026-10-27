import { cn } from '#/lib/utils'

interface MonogramProps {
  // Rendered size in px. Minimum 16.
  size?: number
  className?: string
}

// Figma: Components / Monogram (9:10), the "ts." mark. Drawn from the Figma
// asset with its fills bound to tokens: tile mangrove, strokes on-mangrove,
// cursor logo-cursor — one mark for both themes. Decorative: give the
// surrounding link or heading the accessible name.
export function Monogram({ size = 44, className }: MonogramProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={cn('shrink-0', className)}
    >
      <path
        d="M34.375 0H9.625C4.30926 0 0 4.30926 0 9.625V34.375C0 39.6907 4.30926 44 9.625 44H34.375C39.6907 44 44 39.6907 44 34.375V9.625C44 4.30926 39.6907 0 34.375 0Z"
        fill="var(--mangrove)"
      />
      <g
        stroke="var(--on-mangrove)"
        strokeWidth={3.78125}
        strokeLinecap="square"
        strokeLinejoin="round"
      >
        <path d="M11.6875 9.96875V27.8438C11.6875 28.9378 12.1221 29.987 12.8957 30.7606C13.6693 31.5342 14.7185 31.9688 15.8125 31.9688H17.875" />
        <path d="M6.875 16.8438H17.875" />
        <path d="M31.2812 16.8438H25.2656C24.2628 16.8438 23.301 17.2421 22.5919 17.9513C21.8828 18.6604 21.4844 19.6222 21.4844 20.625C21.4844 21.6278 21.8828 22.5896 22.5919 23.2987C23.301 24.0079 24.2628 24.4062 25.2656 24.4062H26.9844C27.9872 24.4062 28.949 24.8046 29.6581 25.5138C30.3672 26.2229 30.7656 27.1847 30.7656 28.1875C30.7656 29.1903 30.3672 30.1521 29.6581 30.8612C28.949 31.5704 27.9872 31.9688 26.9844 31.9688H20.9688" />
      </g>
      <path
        d="M36.7812 30.0781H34.0312C33.6516 30.0781 33.3438 30.3859 33.3438 30.7656V33.1719C33.3438 33.5516 33.6516 33.8594 34.0312 33.8594H36.7812C37.1609 33.8594 37.4688 33.5516 37.4688 33.1719V30.7656C37.4688 30.3859 37.1609 30.0781 36.7812 30.0781Z"
        fill="var(--logo-cursor)"
      />
    </svg>
  )
}
