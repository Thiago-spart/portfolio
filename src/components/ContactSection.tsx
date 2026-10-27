import { Mail } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import { AUTHOR_EMAIL, LINKEDIN_URL } from '#/lib/seo'
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
// Links come from siteSettings. Until that singleton is published, email and
// LinkedIn fall back to src/lib/seo.ts so the section never empties; GitHub
// only shows once it's set.
export default function ContactSection({ settings }: Props) {
  const { t } = useTranslation()
  const email = settings?.email ?? AUTHOR_EMAIL
  const linkedin = settings?.linkedin ?? LINKEDIN_URL
  const github = settings?.github
  const newTab = <span className="sr-only"> {t('contact.newTab')}</span>

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-4 py-16 md:py-24">
      <Container className="flex flex-col items-start gap-6">
        <h2
          id="contact-heading"
          tabIndex={-1}
          className="m-0 rounded-sm type-display-l text-ink focus:focus-ring"
        >
          {t('contact.title')}
        </h2>
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
