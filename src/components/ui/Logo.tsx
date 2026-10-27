import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'
import { Monogram } from './Monogram'

interface LogoProps {
  // Mark: the monogram alone. Lockup: beside the live wordmark. Lockup with
  // role: plus the role line.
  variant?: 'mark' | 'lockup' | 'lockup-role'
  // Monogram size in px (44 in the desktop header, 36 on phones).
  size?: number
  className?: string
}

// Figma: Components / Logo (9:40). The wordmark is live type: Newsreader
// 600, −1.5% tracking; the gap is a quarter of the mark's width.
export function Logo({ variant = 'mark', size = 44, className }: LogoProps) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex items-center', className)} style={{ gap: size / 4 }}>
      <Monogram size={size} />
      {variant !== 'mark' && (
        <span className="flex flex-col items-start whitespace-nowrap">
          <span className="font-display text-[22px] leading-7 font-semibold tracking-[-0.015em] text-ink">
            Thiago Souza
          </span>
          {variant === 'lockup-role' && (
            <span className="type-small text-ink-muted">{t('brand.role')}</span>
          )}
        </span>
      )}
    </span>
  )
}
