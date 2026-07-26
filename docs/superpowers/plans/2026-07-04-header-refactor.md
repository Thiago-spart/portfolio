# Header Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the leftover TanStack-scaffold header with portfolio-specific branding/nav/links, and make the header stay absent until the user scrolls past the Hero (or an equivalent scroll distance on hero-less pages), then stick to the top for the rest of the scroll.

**Architecture:** Two sequential changes to the single `Header.tsx` component. First, swap out content (logo, nav links, social icons, remove the AI chat widget) with no positioning change, so content correctness can be reviewed independently. Second, add a scroll-position hook that conditionally mounts the header as `fixed` once `window.scrollY` passes `1.5 × window.innerHeight` — the exact distance the home page's Hero takes to fully scroll away.

**Tech Stack:** React 19, TanStack Router (`Link`, `RouterProvider`), Vitest + `@testing-library/react`, Tailwind utility classes + CSS custom properties already defined in `src/styles.css`.

## Global Constraints

- Reuse existing design tokens/classes — `--chip-bg`, `--chip-line`, `--line`, `--header-bg`, `--sea-ink`, `--sea-ink-soft`, `nav-link` — do not invent new ones.
- Reuse the LinkedIn/email SVG icons and URLs already used in `src/components/ContactSection.tsx`: LinkedIn `https://www.linkedin.com/in/thiago-moraes-souza/`, email `mailto:thiagomoraes.contact@gmail.com`.
- Text goes through `useTranslation()` / `t()`, matching every other section component (`ContactSection.tsx`, `HeroSection.tsx`). Any new key must be added to all three locale files (`en.json`, `pt.json`, `es.json`) — the `t()` type is derived from `en.json`'s keys.
- No changes to `src/routes/__root.tsx`, `Footer.tsx`, `about.tsx`, or any route file — out of scope per spec.
- Threshold constant is `1.5` (× `window.innerHeight`) — do not use a different multiplier; it is derived from `HeroSection`'s `250dvh` wrapper minus its `100dvh` pinned section.

---

### Task 1: Rewrite header content (branding, nav, social links, remove AI assistant)

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/es.json`
- Create: `src/test/Header.test.tsx`

**Interfaces:**
- Consumes: `useTranslation()` from `#/i18n/useTranslation` (returns `{ t, lang }`, `t(key: keyof typeof en): string`), `useLanguage()` from `#/i18n/LanguageContext`, `Link` from `@tanstack/react-router`.
- Produces: `Header` default export (no props) — same as before. Task 2 will modify this same file to add scroll-gating; it relies on this task's final JSX structure (the `<header>` element and its children) being in place first.

- [ ] **Step 1: Add new i18n keys to all three locale files**

Add `"nav.about"` and `"nav.contact"` keys. In `src/i18n/locales/en.json`, insert after `"nav.projects": "Projects",`:

```json
  "nav.home": "Home",
  "nav.projects": "Projects",
  "nav.about": "About",
  "nav.contact": "Contact",
```

In `src/i18n/locales/pt.json`, insert after `"nav.projects": "Projetos",`:

```json
  "nav.home": "Início",
  "nav.projects": "Projetos",
  "nav.about": "Sobre",
  "nav.contact": "Contato",
```

In `src/i18n/locales/es.json`, insert after `"nav.projects": "Proyectos",`:

```json
  "nav.home": "Inicio",
  "nav.projects": "Proyectos",
  "nav.about": "Acerca de",
  "nav.contact": "Contacto",
```

- [ ] **Step 2: Write the failing test for header content**

Create `src/test/Header.test.tsx`:

```tsx
// src/test/Header.test.tsx
import { render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '#/i18n/LanguageContext'
import Header from '#/components/Header'

function renderHeader() {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <Header />
      </LanguageProvider>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('Header', () => {
  it('links the brand mark to home', () => {
    renderHeader()
    const brand = screen.getByRole('link', { name: /thiago souza/i })
    expect(brand).toHaveAttribute('href', '/')
  })

  it('renders Home, About, and Contact nav links', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    )
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/#contact',
    )
  })

  it('does not render the old TanStack scaffold links', () => {
    renderHeader()
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
    expect(screen.queryByText('Demos')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/follow tanstack on x/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/go to tanstack github/i),
    ).not.toBeInTheDocument()
  })

  it('does not render the AI assistant widget', () => {
    renderHeader()
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument()
  })

  it('links to LinkedIn and email', () => {
    renderHeader()
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/thiago-moraes-souza/',
    )
    const email = screen.getByRole('link', { name: 'Email' })
    expect(email).toHaveAttribute(
      'href',
      'mailto:thiagomoraes.contact@gmail.com',
    )
  })

  it('still renders the language toggle buttons', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'en' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'es' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/test/Header.test.tsx`
Expected: FAIL — brand link name "thiago souza" not found (current header says "TanStack Start"), and/or "Docs"/"Demos" assertions fail since they currently exist.

- [ ] **Step 4: Rewrite `src/components/Header.tsx`**

Replace the entire file with:

```tsx
import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import type { Lang } from '#/types/sanity'

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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
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
```

Note what got removed relative to the old file: the `TanChatAIAssistant` import/usage, the `Docs` link, the `Demos` `<details>` dropdown (5 demo links), and the X/GitHub icon links.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/Header.test.tsx`
Expected: PASS (all 6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.tsx src/i18n/locales/en.json src/i18n/locales/pt.json src/i18n/locales/es.json src/test/Header.test.tsx
git commit -m "feat: replace TanStack scaffold header with portfolio branding and nav"
```

---

### Task 2: Gate header visibility to scroll position past the Hero

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/test/Header.test.tsx`

**Interfaces:**
- Consumes: the `Header.tsx` file structure produced by Task 1 (same JSX body, same `t()`/`Link` usage).
- Produces: `Header` still exports the same default, but now returns `null` until `window.scrollY > window.innerHeight * 1.5`, after which it renders the same `<header>` markup with `fixed top-0 inset-x-0` instead of `sticky top-0`. No other component reads this hook — it stays private to `Header.tsx`.

- [ ] **Step 1: Write the failing tests for scroll-gated visibility**

Add to the bottom of `src/test/Header.test.tsx` (inside the existing `describe('Header', ...)` block, after the last `it`):

```tsx
  describe('scroll-gated visibility', () => {
    function setScroll(innerHeight: number, scrollY: number) {
      Object.defineProperty(window, 'innerHeight', {
        value: innerHeight,
        configurable: true,
      })
      Object.defineProperty(window, 'scrollY', {
        value: scrollY,
        configurable: true,
      })
    }

    it('is not in the document before scrolling past 1.5x the viewport height', async () => {
      setScroll(800, 0)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('is not in the document just short of the threshold', async () => {
      setScroll(800, 1199)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('renders once scrolled at or past 1.5x the viewport height', async () => {
      setScroll(800, 1200)
      await renderHeader()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('appears in response to a scroll event after mounting below the threshold', async () => {
      setScroll(800, 0)
      await renderHeader()
      expect(screen.queryByRole('banner')).not.toBeInTheDocument()

      setScroll(800, 1300)
      fireEvent.scroll(window)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
```

Add `fireEvent` to the existing `@testing-library/react` import at the top of the file (which by now reads `import { render, screen } from '@testing-library/react'` after Task 1's async fix):

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
```

Note: `renderHeader()` is `async` and does `await router.load()` before rendering — a fix applied after Task 1 (RouterProvider resolves its first match asynchronously, so synchronous `getByRole` queries found nothing without it). Every `it` callback in this file must be `async` and every `renderHeader()` call must be `await`ed, as shown above.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/test/Header.test.tsx`
Expected: FAIL on all 4 new tests — `Header` currently always renders (`getByRole('banner')` always finds it, so the "not in the document" tests fail).

- [ ] **Step 3: Add the scroll-gating hook and wire it into `Header`**

In `src/components/Header.tsx`, add the `useEffect`/`useState` import and the hook above `LangToggle`:

```tsx
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
        window.scrollY > window.innerHeight * REVEAL_THRESHOLD_VIEWPORTS,
      )
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return pastHero
}
```

Change the `Header` function to check the hook and change the header's positioning classes:

```tsx
export default function Header() {
  const { t } = useTranslation()
  const pastHero = useScrollPastHero()

  if (!pastHero) {
    return null
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
```

(The rest of the JSX body — `<nav>` and everything inside it — is unchanged from Task 1.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/test/Header.test.tsx`
Expected: PASS (all 10 tests: 6 from Task 1, 4 new).

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS — no other test imports `Header` or depends on its previous always-visible/sticky behavior (confirm by checking the output list of test files).

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.tsx src/test/Header.test.tsx
git commit -m "feat: hide header until scrolled past the Hero, then stick to top"
```
