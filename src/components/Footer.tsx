import { Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { contactLinks } from '#/lib/contact'
import { GithubMark, LinkedinMark } from './brandIcons'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  settings?: SITE_SETTINGS_QUERY_RESULT
}

// Figma: Home (39:5927 / 39:6098), footer. The contact links repeat here
// (same siteSettings links and fallbacks as the Contact section), then the
// copyright and a Ghost Small "Back to top"; stacked on phones.
export default function Footer({ settings }: Props) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const { email, linkedin, github } = contactLinks(settings)
  const links: Array<{ href: string; label: string; icon: LucideIcon; external: boolean }> = [
    { href: `mailto:${email}`, label: t('contact.email'), icon: Mail, external: false },
    { href: linkedin, label: t('contact.linkedin'), icon: LinkedinMark, external: true },
    ...(github ? [{ href: github, label: t('contact.github'), icon: GithubMark, external: true }] : []),
  ]

  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-start gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <ul aria-label={t('index.contact')} className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          {links.map(({ href, label, icon: Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                className="inline-flex min-h-8 items-center gap-2 rounded-sm type-small text-mangrove no-underline hover:underline"
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0" />
                {label}
                {external && <span className="sr-only"> {t('contact.newTab')}</span>}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end md:gap-6">
          <p className="m-0 type-small text-ink-muted">
            {t('footer.copyright').replace('{year}', String(year))}
          </p>
          {/* "#top" scrolls to the top of the document without an anchor. */}
          <Button href="#top" variant="ghost" size="small">
            {t('footer.backToTop')}
          </Button>
        </div>
      </Container>
    </footer>
  )
}
