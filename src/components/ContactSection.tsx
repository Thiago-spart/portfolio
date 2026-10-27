// src/components/ContactSection.tsx
import { useTranslation } from '#/i18n/useTranslation'
import type { ReactNode } from 'react'
import { AUTHOR_EMAIL, LINKEDIN_URL } from '#/lib/seo'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  settings?: SITE_SETTINGS_QUERY_RESULT
}

// "linkedin.com/in/thiago-moraes-souza/" → "thiago-moraes-souza"
function handle(url: string): string {
  return url.replace(/\/+$/, '').split('/').pop() ?? url
}

// Contact links come from siteSettings. Until that singleton is published,
// email and LinkedIn fall back to src/lib/seo.ts so the section never empties;
// GitHub only shows once it's set.
export default function ContactSection({ settings }: Props) {
  const { t } = useTranslation()
  const email    = settings?.email ?? AUTHOR_EMAIL
  const linkedin = settings?.linkedin ?? LINKEDIN_URL
  const github   = settings?.github

  const cards: Array<{
    label: string
    address: string
    href: string
    target: '_blank' | '_self'
    icon: ReactNode
  }> = [
    {
      label: t('contact.linkedin'),
      address: handle(linkedin),
      href: linkedin,
      target: '_blank',
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: t('contact.email'),
      address: email,
      href: `mailto:${email}`,
      target: '_self',
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
    },
    ...(github
      ? [{
          // Brand name, same in every language.
          label: 'GitHub',
          address: handle(github),
          href: github,
          target: '_blank' as const,
          icon: (
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17v3.21c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
            </svg>
          ),
        }]
      : []),
  ]

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="px-6 py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="contact-heading"
          className="type-heading text-ink"
        >
          {t('contact.title')}
        </h2>
        <p className="mt-3 text-sm text-ink-muted">
          {t('contact.subtitle')}
        </p>

        <div className={`mt-10 grid grid-cols-1 gap-4 ${cards.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target={card.target}
              rel={card.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="flex flex-col items-center justify-center gap-3 rounded-md border border-line bg-surface-raised p-6 text-mangrove no-underline transition-colors hover:border-line-strong"
            >
              {card.icon}
              <p className="text-sm font-bold text-ink">{card.label}</p>
              <p className="text-xs text-ink-muted">{card.address}</p>
              {card.target === '_blank' && (
                <span className="sr-only">(opens in a new tab)</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
