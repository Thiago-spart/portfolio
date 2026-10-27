import { Link } from '@tanstack/react-router'
import { Container } from '#/components/ui/Section'
import { Logo } from '#/components/ui/Logo'
import { LocaleSwitch } from '#/components/ui/LocaleSwitch'
import { ThemeToggle } from '#/components/ui/ThemeToggle'
import { useTranslation } from '#/i18n/useTranslation'

// Figma: Components / Site header (20:712). Lockup left (the mark alone on
// phones); locale switch and theme toggle right. 72px tall, in the content
// column.
export default function Header() {
  const { t } = useTranslation()

  return (
    <header>
      <Container className="flex h-18 items-center justify-between gap-3">
        <Link
          to="/"
          aria-label={t('header.home')}
          className="inline-flex shrink-0 rounded-md no-underline"
        >
          <Logo variant="mark" size={36} className="md:hidden" />
          <Logo variant="lockup" className="hidden md:inline-flex" />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
