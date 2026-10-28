import { Mail } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { contactLinks } from '#/lib/contact'
import { GithubMark, LinkedinMark } from './brandIcons'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  settings?: SITE_SETTINGS_QUERY_RESULT
}

// Figma: Hero / Contact (23:3570, 23:3593). Email is the one Primary action;
// LinkedIn and GitHub support it; the address stays readable underneath.
//
// Contract with the hero: the mango scrolls to #contact and focuses
// #contact-heading (tabIndex -1), which then shows the mango focus ring.
//
// Links come from siteSettings with the fallbacks in src/lib/contact.ts. The
// availability line under the heading is siteSettings.availability (marked
// like the current role on the timeline); it's left out until it's set.
export default function ContactSection({ settings }: Props) {
  const { t, lang } = useTranslation()
  const { email, linkedin, github } = contactLinks(settings)
  const availability = settings?.availability?.[lang]
  const newTab = <span className="sr-only"> {t('contact.newTab')}</span>

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-16 py-16 md:py-24">
      <Container className="flex flex-col items-start gap-6">
        <h2
          id="contact-heading"
          tabIndex={-1}
          className="m-0 rounded-sm type-display-l text-ink focus:focus-ring"
        >
          {t('contact.title')}
        </h2>
        {availability && (
          <p data-testid="availability" className="-mt-2 mb-0 flex items-start gap-2 type-small text-ink">
            <svg aria-hidden="true" width="11" height="11" viewBox="0 0 11 11" className="mt-[4.5px] shrink-0">
              <circle cx="5.5" cy="5.5" r="4.75" strokeWidth="1.5" className="fill-mangrove stroke-mangrove" />
            </svg>
            {availability}
          </p>
        )}
        <p className="m-0 max-w-160 type-lede text-ink-muted">{t('contact.subtitle')}</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href={`mailto:${email}`} icon={Mail}>
            {t('contact.email')}
          </Button>
          <Button href={linkedin} variant="secondary" icon={LinkedinMark} target="_blank" rel="noopener noreferrer">
            {t('contact.linkedin')}
            {newTab}
          </Button>
          {github && (
            <Button href={github} variant="secondary" icon={GithubMark} target="_blank" rel="noopener noreferrer">
              {t('contact.github')}
              {newTab}
            </Button>
          )}
        </div>
        <p className="m-0 type-code text-ink-muted">{email}</p>
      </Container>
    </section>
  )
}
