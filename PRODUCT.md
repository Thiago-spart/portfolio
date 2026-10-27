# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary reader of the home page: the engineering manager.** A Head of Front-end or Engineering Manager at a product company of 50 to 500 people (fintech, edtech, health), deciding whether Thiago can raise a team's quality bar. Reads case studies in full, then checks GitHub and LinkedIn. Wants decisions, trade-offs and before/after numbers, not a list of tools. Fears seniors who interview well and deliver little.
- **Commercial priority: contract clients.** Founders, CTOs and small-agency partners who need one person to ship a web and mobile product on a date, maintainably. They skim for similar products and live links, then message directly. Engineering managers who bring in contractors sit in both groups.
- **Secondary readers:** technical recruiters scanning in about ten seconds for title, years, stack, languages and availability; peer developers who arrive through posts and refer.

Personas in full: `~/Work/personal/brand/project/strategy/2-personas.md` (Marina, Daniel, Paula, Lucas).

## Product Purpose

A personal portfolio for Thiago Souza, senior mobile and web engineer (React, React Native, TypeScript, seven years). It exists to win contract work first and senior or lead roles second, by showing what changed in each product he worked on, with numbers. Success: a qualified visitor reaches a case study, believes the result, and gets in touch (email or LinkedIn).

## Positioning

Where most engineers describe what they built, Thiago reports what changed. Every claim is backed by a measured, sourced result: Lighthouse 40 → 95 and organic search +40% (Redação Online), production bugs −96% at 80% test coverage (Capitual), checkout drop-off 23% → 9% (Redação Online), 0.9s LCP (C6 Bank). One person covers web and mobile in one TypeScript style, has led (Lead Frontend Engineer at Redação Online), and works in English, Portuguese and Spanish.

The site itself is evidence of the claim: it must stay fast, tested and accessible.

He is not a generalist full-stack developer, not a designer, not an "AI developer" (agents are how he delivers, never what he sells), and not the cheapest option.

## Operating Context

- Visitors arrive from LinkedIn, referrals, direct messages and posts, often on phones.
- Content lives in Sanity (project `wbbntp0o`): case studies, roles, techs, FAQ, site settings. The Studio is edited locally.
- Every string ships in en, pt and es; technical terms stay in English in all three.
- `llms.txt` and the sitemap are generated from the same content for search and AI crawlers.

## Capabilities and Constraints

- Stack: TanStack Start, React 19, Tailwind CSS 4, Sanity; deployed on Vercel. All Sanity fetches run server-side.
- Routes: `/` (hero, projects, experience, stack, how I work, contact) and `/projects/:slug` (case study). URLs are stable.
- Performance contract from the hero brief: the headline is the LCP element, the SVG poster renders before any 3D, no raster images in the hero, reduced motion shows the final state, CLS 0. Targets: Lighthouse 95+ mobile, 100 accessibility, best practices and SEO.
- Open decision: the live availability line reads "Open to senior and lead roles", which points at full-time work while the confirmed priority is contracts first. To revisit in Site Settings.
- Open decision: there is no "Work with me" page for contract clients yet; the contact block serves both audiences.

## Brand Commitments

- Name: Thiago Souza. Monogram "ts" with the mango cursor.
- Voice: a senior engineer explaining a decision to a peer: specific, calm, no hype. Lead with the result, then the method. "I" for his work, "we" for team results. Every claim gets a number or a named thing. No "passionate", "ninja", "rockstar", "cutting-edge", "revolutionary", "seamless", "synergy"; no exclamation marks or emoji. Sentence case for headings and buttons. Real minus sign (−96%), arrow for before → after (40 → 95).
- Tagline: "Engineering you can measure."
- Creative concepts must not draw on Recife or Pernambuco; factual work credits (Government of Pernambuco) stay.
- Brand system and voice rules: `~/Work/personal/brand/project/README.md`, `tokens.json`; positioning `strategy/1-positioning.md`; bios `strategy/3-bios.md`.

## Evidence on Hand

- 13 case studies in Sanity (4 featured), 6 roles, 4 FAQ answers, all with real numbers taken from shipped work.
- Live links: Redação Online, C6 Bank, Bask, Capitual, Lovefy.
- Absent, do not fabricate: testimonials, client logos used with permission, pricing, availability dates, a CV file in Site Settings, real case-study screenshots (current covers are promo cards and need replacing).

## Product Principles

1. Result first, method second, on every surface.
2. Every number is real and sourced from shipped work; no number, no adjective.
3. The site is its own proof: it stays fast, tested and accessible, and the performance contract is not traded for effect.
4. One reader per surface: the home page writes to the engineering manager; contract clients get a direct path to contact.
5. Equal in three languages.

## Accessibility & Inclusion

WCAG 2.2 AA. Keyboard access for every interaction, including the hero (results reachable without the canvas); visible focus (2px mango ring); `prefers-reduced-motion` respected; no information conveyed by colour alone (score bands carry a glyph).
