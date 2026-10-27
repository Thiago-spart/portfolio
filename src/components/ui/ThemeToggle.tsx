import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { applyTheme, resolvedTheme, subscribeTheme, type Theme } from '#/lib/theme'
import { Button } from './Button'

// The server can't know the visitor's theme; it renders the light-theme
// label and the client corrects it right after hydration (no mismatch:
// useSyncExternalStore hydrates with the server snapshot first).
const serverTheme = (): Theme => 'light'

// Figma: Components / Theme toggle (9:92). A small secondary button that
// names the theme it switches to: in light, "Dark theme" with the moon.
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const theme = useSyncExternalStore(subscribeTheme, resolvedTheme, serverTheme)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="secondary"
      size="small"
      icon={next === 'dark' ? Moon : Sun}
      onClick={() => applyTheme(next)}
      className={className}
    >
      {next === 'dark' ? t('theme.toDark') : t('theme.toLight')}
    </Button>
  )
}
