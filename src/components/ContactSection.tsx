// src/components/ContactSection.tsx
import { useTranslation } from '#/i18n/useTranslation'
import { GlowCard } from '#/components/ui/glow-card'
import type { ReactNode } from 'react'
import type { GlowColor } from '#/components/ui/glow-card'

export default function ContactSection() {
  const { t } = useTranslation()

  const cards: Array<{
    label: string
    address: string
    href: string
    target: '_blank' | '_self'
    glowColor: GlowColor
    icon: ReactNode
  }> = [
    {
      label: t('contact.linkedin'),
      address: 'thiago-moraes-souza',
      href: 'https://www.linkedin.com/in/thiago-moraes-souza/',
      target: '_blank',
      glowColor: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-[#00aaff]" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: t('contact.email'),
      address: 'thiagomoraes.contact@gmail.com',
      href: 'mailto:thiagomoraes.contact@gmail.com',
      target: '_self',
      glowColor: 'purple',
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-[#7b2fff] fill-none" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ]

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="cyberpunk-surface px-6 py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          id="contact-heading"
          className="font-['Bebas_Neue'] text-[clamp(2rem,5vw,4rem)] tracking-wider text-white"
        >
          {t('contact.title')}
        </h2>
        <p className="mt-3 text-sm text-[rgba(255,255,255,0.55)]">
          {t('contact.subtitle')}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <GlowCard
              key={card.label}
              href={card.href}
              target={card.target}
              rel={card.target === '_blank' ? 'noopener noreferrer' : undefined}
              glowColor={card.glowColor}
              customSize
              className="flex flex-col items-center justify-center gap-3 p-6 no-underline"
            >
              {card.icon}
              <p className="text-sm font-bold text-white">{card.label}</p>
              <p className="text-xs text-[rgba(255,255,255,0.55)]">{card.address}</p>
              {card.target === '_blank' && (
                <span className="sr-only">(opens in a new tab)</span>
              )}
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
