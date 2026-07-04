import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import type { Lang } from '#/types/sanity'

// The Hero section's wrapper is 250dvh tall with a 100dvh pinned inner
// section, so it fully releases at 250dvh - 100dvh = 1.5x viewport height.
// Reusing that threshold everywhere keeps the header's reveal point
// consistent across pages that don't have a Hero at all.
const REVEAL_THRESHOLD_VIEWPORTS = 1.5

function useScrollPastHero(): boolean {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    function check() {
      setPastHero(
        window.scrollY >= window.innerHeight * REVEAL_THRESHOLD_VIEWPORTS,
      )
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return pastHero
}

function LangToggle() {
  const { lang, setLang } = useLanguage()
  const langs: Lang[] = ['en', 'pt', 'es']
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-[var(--line)] p-0.5">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-lg px-2 py-1 text-xs font-bold uppercase transition ${
            lang === l
              ? 'bg-[var(--electric-blue,#00aaff)] text-[#050508]'
              : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const pastHero = useScrollPastHero()

  if (!pastHero) {
    return null
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Thiago Souza
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            {t('nav.about')}
          </Link>
          <a href="/#contact" className="nav-link">
            {t('nav.contact')}
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href="https://www.linkedin.com/in/thiago-moraes-souza/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:block"
          >
            <span className="sr-only">{t('contact.linkedin')}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="mailto:thiagomoraes.contact@gmail.com"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:block"
          >
            <span className="sr-only">{t('contact.email')}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth={1.5}
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </a>
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
