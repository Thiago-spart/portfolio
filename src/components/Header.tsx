import { Link, useRouterState } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { Logo } from '#/components/ui/Logo'
import { LocaleSwitch } from '#/components/ui/LocaleSwitch'
import { ThemeToggle } from '#/components/ui/ThemeToggle'
import { useTranslation } from '#/i18n/useTranslation'

// Figma: Components / Site header (20:712). Lockup left (a smaller lockup on
// phones, so the name is above the fold there too); locale switch and theme
// toggle right (the toggle is icon-only on phones). 72px tall, in the
// content column, in the page flow: the home page's sheet index is the only
// bar that sticks. Off the home page (whose hero and index already carry it),
// a Small Primary "Get in touch" leads to the page's closing Contact block;
// from 640px, where it fits beside the switches.
export default function Header() {
  const { t } = useTranslation()
  const home = useRouterState({ select: (state) => state.location.pathname === '/' })

  return (
    <header>
      {/* First stop for keyboard and screen-reader visitors: past the header
          and the sheet index, straight to the page's content. */}
      <a
        href="#main"
        className="sr-only rounded-sm border border-line bg-surface-raised px-3 py-2 type-small text-ink no-underline focus:not-sr-only focus:fixed focus:top-2 focus:left-4 focus:z-50"
      >
        {t('a11y.skip')}
      </a>
      <Container className="flex h-18 items-center justify-between gap-2 md:gap-3">
        <Link
          to="/"
          aria-label={t('header.home')}
          className="inline-flex shrink-0 rounded-md no-underline"
        >
          <Logo variant="lockup" size={36} className="md:hidden" />
          <Logo variant="lockup" className="hidden md:inline-flex" />
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          {!home && (
            <Button href="#contact" size="small" className="max-sm:hidden">
              {t('hero.cta.contact')}
            </Button>
          )}
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
