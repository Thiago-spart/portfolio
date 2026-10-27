# Content migration review (#46)

## Approved 2026-10-27

The review below was approved with these final decisions. The output reflects all of them.

1. **Featured case studies:** as recommended, in this order: Redação Online landing page, Capitual internal administration tool, Redação Online checkout, C6 Bank.
2. **Hero results:** as recommended: Lighthouse 40 → 95, production bugs −96%, checkout drop-off 23% → 9%.
3. **Metric qualifier:** `metric` now has an optional `qualifier` (#41): `atLeast` renders "95+" / "80%+", `change` always shows the sign ("+40%", "−96%"). Negatives print with a real minus sign (U+2212). The 7 metrics that are "at least" values (4) or changes (3) now carry it (see [Metrics](#metrics)).
4. **FAQ:** the recommended 4. "Gaps between contracts" is dropped, as are the other two.
5. **Bask:** stays without a role. `role` is optional on `caseStudy`, and the site handles a case study without one.
6. **Tech:** practices the text clearly shows are kept and linked: Headless CMS (landing page), Code review & pair programming (both Capitual internal tools), Design systems & tokens (Capitual customer assistance tool), Code splitting & lazy loading (Freelance (Independent Contracts) role, the only place the text shows it). Claude Code is kept as a document, linked nowhere (no role or case study text mentions it), so the Stack section won't list it until something references it. Everything else stays trimmed. The lists live in `content.ts` (`STACK_ADDITIONS`, `KEEP_UNUSED`).

Still open, for the manual pass after import: the [data problems in the source](#things-that-look-wrong-in-the-source) (the Capitual app link, covers, Lovefy) and confirming the GitHub URL.

**Final counts:** 154 documents: 130 `tech`, 6 `role`, 13 `caseStudy` (4 featured, 9 archive), 4 `faq`, 1 `siteSettings`.

This folder turns the 36 published documents in `production` into the new content model, as a file you import after you've reviewed it. Nothing has been written to Sanity. The old documents stay as they are; #47 switches the site over and removes them.

| File | What it is |
| --- | --- |
| `snapshot.ndjson` | All 36 published documents, read from the public API on 2026-10-26 (no drafts existed). Public portfolio content only, nothing sensitive. |
| `content.ts` | Every editorial call: summaries, alt text, metric table, featured picks, FAQ picks, site settings. **Edit this to change the output.** |
| `mapping.ts` | Pure helpers: metric number parsing, tech name normalization, role matching, Portable Text. |
| `build.ts` | Snapshot + content → `new-documents.ndjson`. Creates documents only. `--report` prints the tech mapping, dropped items, role matches, metric conversions and misfits as JSON. |
| `ids.json` | The random UUID given to each new document on the first build. Rebuilds reuse them, so references and `--missing` stay stable. |
| `validate.ts` | Offline check of the output against the schema rules. |
| `new-documents.ndjson` | **The file to import.** 154 documents. |

To change something: edit `content.ts`, then run `node sanity/migrations/content-model/build.ts && node sanity/migrations/content-model/validate.ts` from the repo root (or use `npx tsx` instead of `node` on Node older than 23.6).

## Decisions that were up for review

These are the questions the review asked; the answers are in [Approved 2026-10-27](#approved-2026-10-27).

1. **Featured case studies.** 4 recommended (below).
2. **Bask has no role.** Its dates (Jul–Aug 2024) fall inside the Redação Online years and no freelance role covers them.
3. **How "+" and "−" are stored in metrics.** Solved with the `qualifier` field.
4. **FAQ.** 4 kept, 3 cut, including the question about gaps between contracts.
5. **Tech trimming.** Now 31 items dropped, 15 of them practices.
6. **Data problems found in the old content.** See [Things that look wrong in the source](#things-that-look-wrong-in-the-source). The Capitual app's live link points to a different company's app.

## Counts

| Old | → | New |
| --- | --- | --- |
| 6 `experience` | → | 6 `role` |
| 13 `project` | → | 13 `caseStudy` (4 featured, 9 archive) |
| 7 `qa` | → | 4 `faq` (3 left out, see below) |
| 10 `skillCategory` (135 skills) + every `techStack` string | → | 130 `tech` (31 dropped) |
| (none, in code today) | → | 1 `siteSettings` |
| **36** | → | **154** |

All 13 slugs are unchanged, so `/projects/<slug>` URLs keep working once #47 points them at `caseStudy`.

## Tech

Each skill and every `techStack` string goes through one spelling-insensitive lookup (`CANONICAL` in `mapping.ts`): case, spaces, dots, hyphens and a trailing "js" don't matter, so "Next.js", "NextJS" and "nextjs" are one tech. The build stops if it meets a name the table doesn't know.

° = in the old skills list but in no role or case study stack. Kept as a document; the Stack section, which is built from what case studies use, won't show it.

| Category | Techs |
| --- | --- |
| frontend (43) | Ant Design, Axios, BEM °, Chart.js, CSS, daisyUI, Draco, Drei, Framer Motion, GSAP, HTML, ISR, JavaScript, Jotai °, List virtualization, MUI, Next.js, PDF.js °, Preact °, PWA, Radix UI °, React, React Hook Form °, React Server Components, React Three Fiber, Recoil °, Redux °, Sass °, shadcn/ui, SSG, SSR, styled-components, Tailwind CSS, TanStack Query, TanStack Router, TanStack Start, Three.js, TypeScript, Vite, Vue, WebGL °, Zod °, Zustand |
| mobile (17) | AsyncStorage, Expo, Expo Local Authentication °, Geolocation, Google Maps API, NativeWind °, Notifee °, React Native, React Native Keychain °, React Native Maps °, React Native Reusables °, React Native Vision Camera °, React Navigation °, Reanimated °, Tamagui, UI Kitten °, WatermelonDB ° |
| backend (9) | Bun °, Express °, GraphQL, NestJS, Node.js, PHP, Supabase Edge Functions °, WebSockets, WordPress |
| data (10) | Drizzle ORM °, Firebase, MongoDB °, PostgreSQL °, Prisma °, Redis °, Row-Level Security (RLS) °, SQL °, SQL migrations °, Supabase ° |
| testing (12) | Cypress, Database integration tests °, E2E testing, Jest, Maestro, MSW °, Playwright, React Native Testing Library, React Testing Library, Storybook, Vitest, Vitest Browser Mode ° |
| tooling (19) | AWS, Bash °, Bitbucket °, CI/CD, Cloudflare, Docker, Docker Compose, Figma, Fly.io °, Git, GitHub, GitHub Actions, Google Cloud °, Lighthouse, Postman, Python °, Sentry °, Supabase CLI °, Vercel |
| ai (7) | AI agents, Antigravity, Claude, Claude Code °, Cursor, MCP, OpenAI GPT |
| practice (13) | Accessibility (a11y), Atomic Design, BFF (Backend for Frontend), Code review & pair programming †, Code splitting & lazy loading †, Core Web Vitals, Design systems & tokens †, Headless CMS †, i18n, Local-first, Micro-frontends, Offline-first, SEO |

† = not in any old `techStack`, added to the stacks whose text shows it (`STACK_ADDITIONS` in `content.ts`, approved 2026-10-27). Claude Code is kept by `KEEP_UNUSED`.

**Spellings merged or split:** daisyUI ← DaisyUI · styled-components ← Styled Components · shadcn/ui ← Shadcn UI · Sass ← SASS · Vue ← Vue.js · TanStack Query ← React Query · React Testing Library ← RTL · React Native Testing Library ← RNTL · React Three Fiber ← R3F · GSAP ← ScrollTrigger · Framer Motion ← Motion (Framer Motion) · Draco ← Draco Compression · WordPress ← WordPress REST API · Cloudflare ← Cloudflare CDN, Cloudflare (Workers & Wrangler) · Supabase ← Supabase Auth & Storage · Google Cloud ← GCP · MCP ← MCP Servers · Antigravity ← Antigravity (agy) · AI agents ← AI Agents, AI Workflow Automation, Agentic Development & AI Pair Programming · Micro-frontends ← Micro-Frontends, Micro-Frontend Architecture · BFF ← Backend-For-Frontend (BFF) · Core Web Vitals ← Web Vitals (FCP, TTI), Performance Engineering (Web Vitals) · Offline-first, Local-first, Accessibility (a11y), E2E testing, MSW: casing only. Split: "TanStack Start/Router", "SSR / SSG / React Server Components", "Git & GitHub", "GPT / AI Agents" (→ OpenAI GPT + AI agents).

**Worth a look:** "ISG" became **ISR**, the Next.js name for it. "React Virtualization" became **List virtualization**, since it's not a library name. "Maps & Geolocation" became **Geolocation**.

### Dropped (31)

- **Operating Systems, all 10** (#43): Linux, Terminal / CLI, Arch Linux, Omarchy, Linux Mint, Manjaro, Ubuntu, Xubuntu, Windows, macOS.
- **AI tools in no stack, 6**: GitHub Copilot, Gemini, v0, ChatGPT, Windsurf, Lovable. Claude, Claude Code, Cursor, Antigravity and MCP stay.
- **Practices in no stack, 15** (#43 says "trim AI tools and practices to what case studies show"): Real-time / event-driven architecture, Contract-first APIs, Clean Architecture / SOLID, TDD, BDD, Component-driven development, Agile / Scrum, Spec-driven development, Prompt engineering, Vibe coding, Issue-driven development, Agent guardrails, Server vs client state, Isolated worker services, Security by design.

**Kept and linked (approved):** Headless CMS → landing page case study ("turning WordPress into a Headless CMS behind a dedicated Next.js BFF layer"). Code review & pair programming → Capitual internal administration tool and customer assistance tool ("pair programming sessions and code review"). Design systems & tokens → Capitual customer assistance tool ("Converted Figma design tokens into pixel-perfect components"). Code splitting & lazy loading → Freelance (Independent Contracts) role; no case study text shows it. **Claude Code** is kept unlinked. To restore another one, add it to `STACK_ADDITIONS` (or `KEEP_UNUSED`) in `content.ts` and rebuild.

## Roles

`title` comes from the old `role` field. `summary` is a new 2–3 sentence draft in EN/PT/ES. The STAR story moves to the case studies. `companyLogo` is not carried over because the new schema has no field for it (only Redação Online had one).

| Company | Dates | Old description (EN) | New summary (EN) |
| --- | --- | --- | --- |
| Government of Pernambuco (Freelance) | 2019-09 → 2021-08 | 550 chars | 308 chars: "I built the school app and public websites for the state education network: a React Native app used by 70k+ students, parents and teachers across 13 schools, plus 14 blogs and landing pages in React and WordPress. I also set up unit and E2E tests, kept the sites at Lighthouse 90+ and cut bundle size by 30%." |
| Plin Moradores/Plin Condomínios | 2021-08 → 2021-10 | 524 | 281: "I moved the web app from class components to React Hooks and built the React Native app, with WebSockets for real-time data. A testing and Storybook pipeline (Jest, RTL, RNTL) reached 70% coverage and let designers review components directly, which sped up feature delivery by 30%." |
| Capitual | 2021-10 → 2022-11 | 876 | 277: "I worked on the front end of Capitual's internal tools and mobile banking app, in a micro-frontend architecture with React, GraphQL and AWS. We built a testing pipeline with Cypress, Jest and Storybook that reached 80% coverage on critical flows and cut production bugs by 96%." |
| Freelance (Independent Contracts) | 2022-11 → 2023-02 | 735 | 246: "Short contracts for startups and fintechs: React-to-Next.js migrations with SSR and code splitting, and React Native MVPs delivered in about 3 weeks. On the web projects I reached Lighthouse 95+ on mobile, 98+ on desktop and 100 on accessibility." |
| Redação Online | 2023-02 → 2025-01 | 1,106 | 301: "I led the front end of an edtech platform for ENEM and public-exam students. I moved the landing page from PHP and WordPress to Next.js (Lighthouse 40 → 95, organic search +40%), migrated checkout to Vite, Vue and TypeScript (drop-off 23% → 9%), and built a shared Storybook library of 45+ components." |
| Freelance | 2025-01 → now | 849 | 264: "I build web and mobile products for startups with React Native, Next.js and Vite. Recent work: Skydiet's web and mobile apps on one Tamagui codebase, C6 Bank's landing page at 0.9s LCP, and agent workflows that cut Lovefy's feature delivery from 2 weeks to 4 days." |

PT and ES are in `content.ts` (`ROLE_SUMMARIES`) and in the output.

## Case studies

Each case study links to a role by company name in the title, or else by overlapping dates with a freelance role. Named employers are never matched on dates alone.

| Case study | Role (matched by) | Tier | Results |
| --- | --- | --- | --- |
| Redação Online – Landing Page Migration | Redação Online (name) | **featured #1** | Lighthouse 40 → 95 · organic search +40% |
| Internal Administration Tool (Capitual) | Capitual (name) | **featured #2** | production bugs −96% · coverage 80% |
| Redação Online – Checkout Migration | Redação Online (name) | **featured #3** | checkout drop-off 23% → 9% |
| C6 Bank – Web Platform & Landing Page | Freelance 2025– (dates) | **featured #4** | LCP 0.9s · FCP 1.5s · Lighthouse 90 · a11y 100 · best practices 100 |
| Capitual Cripto Bank App | Capitual (name) | archive | App Store rating 3.5 → 4.8 · mobile bugs −60% |
| Redação Online – Core EdTech Platform v2 | Redação Online (name) | archive | Lighthouse 95+ · downtime 0 · Storybook components 45+ |
| Redação Online – AI Mentor Chat | Redação Online (name) | archive | none |
| Customer Assistance Internal Tool (Capitual) | Capitual (name) | archive | Storybook coverage 80% · onboarding 4wk → 3wk |
| Electromaps | Freelance (Independent Contracts) (dates) | archive | time to ship 3mo · coverage 100% |
| Lovefy – AI Dating Platform | Freelance 2025– (dates) | archive | delivery time 14d → 4d · test & docs coverage 100% |
| Skydiet – Universal Cross-Platform App | Freelance 2025– (dates) | archive | code shared 80%+ |
| Skydiet – Web Application & UI Library | Freelance 2025– (dates) | archive | coverage 90% · library components 40+ |
| Bask – Telehealth Platform & 3D Interactive Web | none (approved: unlinked) | archive | none |

**Why these four are featured** ("Engineering you can measure": strongest before → after, one per claim on the positioning page):

1. **Landing page migration**: the headline number, Lighthouse 40 → 95, plus organic search +40%. It's the first proof in every bio.
2. **Capitual internal tools**: production bugs −96% at 80% coverage. This is the "quality built in" proof and the second hero number. If you'd rather the card read as "Capitual", retitle it, since the −96% was across the internal tools.
3. **Checkout migration**: drop-off 23% → 9%, the clearest business result you have, and the third hero number. It's also the "change without downtime" claim.
4. **C6 Bank**: 0.9s LCP and Lighthouse 90/100/100 on a site with millions of users, with a live link. It's a well-known brand and a different employer from the other three.

Runner-up: the **Capitual banking app** (App Store 3.5 → 4.8), if you want a mobile case among the featured. It would replace C6 Bank.

**How the fields were filled:**
- **summary** ← `shortDescription`. Most read as stack lists ("…built with Next.js, Three.js, React Three Fiber, GSAP…"). Rewrite at least the four featured ones result-first.
- **problem** ← first paragraph of `longDescription`, plus `challenges` as bullets.
- **approach** ← the rest of `longDescription`, plus `highlights` as bullets. Highlights that only repeat a result number were dropped (`HIGHLIGHTS_FOLDED_INTO_RESULTS`). Some bullets still repeat the paragraph, so trim them in the manual pass.
- PT and ES use your existing translations everywhere. Nothing new was translated for problem/approach.
- **cover** reuses the same `asset._ref` (no upload), with new alt text in three languages written from looking at each image. **gallery** and **video** were empty on every project. `category`, `status` and `featured` are not carried over.

## Metrics

**One convention:**
- Before → after keeps both numbers ("40 → 95" → before 40, after 95).
- A level stays as written ("80% coverage" → after 80, unit %, up).
- A change with no baseline gets **qualifier `change`**, which always shows the sign. A reduction is stored as a **negative after** with direction down ("96% fewer bugs" → after −96, unit %, change, down → "−96%"); growth stays positive ("+40%" → after 40, unit %, change, up → "+40%"). `formatMetric` prints a real minus sign (U+2212).
- "At least" values get **qualifier `atLeast`**, which adds a trailing "+" ("95+" → after 95, atLeast → "95+"; "80%+" → after 80, unit %, atLeast → "80%+").
- Units are glued to the number, as `formatMetric` does: `%`, `s`, `wk`, `mo`, `d`.

| Case study | Source | Raw | Stored | Note |
| --- | --- | --- | --- | --- |
| landing | experience Redação Online · h1 | 40 → 95 | before 40, after 95, up | hero #1 |
| landing | experience Redação Online · h2 | +40% | after 40 %, change, up | renders "+40%" |
| checkout | project highlight 3 | 23% → 9% | before 23, after 9 %, down | hero #3 |
| core v2 | project highlight 3 | 95+ | after 95, atLeast, up | renders "95+" |
| core v2 | project highlight 3 | zero downtime | after 0, down | odd as a number; cut it if it reads strangely |
| core v2 | project highlight 0 | 45+ | after 45, atLeast, up | renders "45+" |
| Capitual tools | experience Capitual · h2 | 96% (reduced) | after −96 %, change, down | hero #2, renders "−96%" |
| Capitual tools | experience Capitual · h1 | 80% | after 80 %, up | |
| Capitual app | project highlight 3 | 3.5 → 4.8 | before 3.5, after 4.8, up | |
| Capitual app | project highlight 3 | 60% (cut) | after −60 %, change, down | renders "−60%" |
| Capitual support tool | project highlight 2 | 80% | after 80 %, up | |
| Capitual support tool | project highlight 3 | 4 weeks → 3 weeks | before 4, after 3, unit wk, down | |
| C6 Bank | project highlight 3 | 0.9s / 1.5s | after 0.9 s / 1.5 s, down | LCP / FCP |
| C6 Bank | project highlight 2 | 90 / 100 / 100 | after 90 / 100 / 100, up | performance / accessibility / best practices |
| Electromaps | project highlight 3 | 3 months | after 3, unit mo, down | |
| Electromaps | project highlight 3 | 100% | after 100 %, up | coverage on critical flows |
| Skydiet universal | project highlight 0 | 80%+ | after 80 %, atLeast, up | renders "80%+" |
| Skydiet web | project highlight 2 | 90% | after 90 %, up | |
| Skydiet web | project highlight 0 | 40+ | after 40, atLeast, up | renders "40+" |
| Lovefy | project highlight 4 | 2 weeks → 4 days | before 14, after 4, unit d, down | converted to days |
| Lovefy | project highlight 3 | 100% | after 100 %, up | test and documentation coverage |

The landing page and Capitual tools project highlights repeat the experience numbers, so each number appears once.

### Misfits (not converted; nothing dropped silently)

With the qualifier, every "+" in a case study metric now fits. What's left below either isn't a number or has no case study to live on.

| Source | Value | Why it doesn't fit | Proposal |
| --- | --- | --- | --- |
| experience Redação Online · h3 | Next.js SSG + BFF | not a measurement | already in the landing page approach; nothing to do |
| experience Capitual · h3 | Storybook & E2E | not a measurement | already in the Capitual tools approach; nothing to do |
| experience Freelance (Independent Contracts) · h1 | 95+/98+ | no web case study for that role (its only one, Electromaps, is mobile) | kept in the role summary; to show it, add a case study with two `atLeast` metrics (95+, 98+) |
| experience Freelance (Independent Contracts) · h2 | 100 (accessibility) | fits, but nowhere to attach it | kept in the role summary |
| experience Freelance (Independent Contracts) · h3 | 3 wks | average across projects; Electromaps took 3 months | kept in the role summary; don't attach it to Electromaps |
| experience Government of Pernambuco · h1–h5 | 70k+ · 13 · 14 · 90+ · 30% | no case study for this role | kept in the role summary. **Good case study candidate**: a school app with 70k+ users (after 70, unit "k", `atLeast` renders "70k+") |
| experience Plin · h1–h3 | 30% · 100% · 70% | no case study for this role | kept in the role summary; a Plin case study would also back the zero-downtime FAQ answer |
| experience Freelance 2025– · h1–h3 | PWA · Firebase · AI Agents | not measurements | PWA, Firebase and AI agents are in the role stack |
| AI Mentor Chat | "sub-second" streaming | not a number | no result on that case study; add time-to-first-token if you have it |
| Skydiet universal | "sub-second" chat | not a number | left in the approach bullets |
| Capitual app | 60–70 FPS | a range, stated as a challenge | not converted; if 60 fps held after the work, add after 60, unit " fps" |

**Schema change (`metric`, approved, #41):** an optional `qualifier` with the values `atLeast` (renders "95+", "70k+") and `change` (renders "+40%", "−96%"). `change` can't be combined with `before`. The migration sets it on the 7 metrics above, so nothing needs setting by hand.

## Hero results (siteSettings)

All three are backed by case study metrics, picked by reference (case study + the metric's `_key`):

1. Lighthouse 40 → 95: Redação Online landing page migration
2. Production bugs −96%: Capitual internal administration tool
3. Checkout drop-off 23% → 9%: Redação Online checkout migration

The 23% → 9% figure is in the source, but only in the checkout project's own text (short description and highlight 3). No experience highlight carries it. It's your number, so please confirm it's one you can defend.

**Other siteSettings fields:**
- **availability**: "Open to senior and lead roles" / "Aberto a vagas sênior e de liderança" / "Abierto a roles sénior y de liderazgo". Taken from `hero.badge` on `copy/brand-voice`. Those copy changes are uncommitted in the main checkout.
- **email and LinkedIn**: from `ContactSection.tsx`.
- **GitHub: guessed.** `ContactSection.tsx` has no GitHub link. I used `https://github.com/Thiago-spart`, the account that owns this repo. Confirm it.
- **SEO title and description**: from `src/lib/seo.ts` on `copy/brand-voice` ("Thiago Souza — Senior Mobile & Web Engineer"). PT and ES follow the bios.
- **Not migrated: OG image and CV.** Both are local files (`public/og-image.png`, no CV in the repo) and would need an asset upload. Add them in Studio.

## FAQ ("How I work")

Kept, in this order. Question and answer text are unchanged; answers become rich text:

1. Legacy systems and zero-downtime migrations (Plin, class components → hooks): *change without downtime*.
2. Lighthouse 95+ and 80% less page weight at Redação Online: *performance you can measure*.
3. Design consistency and deploys across micro-frontends: *quality built in*, one UI library.
4. AI agent pipelines with Claude and Antigravity: *agents with guardrails*.

Left out. Their text is still in the old `qa` documents and in `snapshot.ndjson`:

- **"I notice there are gaps between your full-time contracts and freelance projects…"** I recommend dropping it. On the page it answers a doubt most visitors never had, and the answer reads as defensive. Recruiters who do ask get the one-line answer from the positioning page, in conversation.
- **React Native performance with long lists.** It overlaps the Lighthouse answer (both are about speed), and its proof (60 fps, 3.5 → 4.8 rating) is better shown in the Capitual app case study.
- **"As a Full Stack Engineer, what is your primary tech stack…"** The Stack section answers it, and the framing contradicts the positioning ("not a generalist full-stack developer").

To keep one of these anyway, add its id to `FAQ_KEEP` in `content.ts` and rebuild.

The questions are long for a "How I work" heading. Shorter framings to consider: "How I migrate without downtime", "How I get to Lighthouse 95+", "One UI across many micro-frontends", "How I use AI agents safely".

## Things that look wrong in the source

Migrated as they are, unless noted. Fix them in Studio after import, or in `content.ts` before.

- **The Capitual banking app's live link is someone else's app.** `apps.apple.com/kg/app/bitcoin-trading-capital-com/…` is Capital.com, not Capitual. Remove or replace it.
- **Government of Pernambuco `companyUrl` was your own LinkedIn profile.** Cleared (`COMPANY_URL_OVERRIDES`).
- **Plin's `companyUrl` is a login page** (`app.plincondominios.com.br/session/login`). Consider the public site.
- **Covers are promo cards, not screenshots.** Each is a device mock-up with "Landing page: CLICK HERE" buttons baked into the image. On a site those buttons look clickable but aren't, and the brand asks for plain device screenshots on a plate. The alt text describes only the product shown.
- **Shared covers.** All four Redação Online case studies use the landing page image. The Capitual app and both internal tools use Capitual's public website image, which shows neither the app nor the tools.
- **Lovefy.** The cover's phone screen reads "Charm your AI girlfriend, unlock a spicy photo", while the case study describes "long-term dating". Decide whether this belongs on a portfolio aimed at engineering managers. At minimum, crop or replace the cover.
- **Two roles are just "Freelance".** "Freelance (Independent Contracts)" 2022–23 and "Freelance" 2025–now. Clearer names would help the timeline.
- **Electromaps vs "3-week MVPs".** The role says MVPs take about 3 weeks, while its only case study took 3 months. Both are true, but they sit next to each other.

## Validation

- `node sanity/migrations/content-model/validate.ts --remote-assets`: **154 documents, no problems.** It checks required fields and the en/pt/es locales; tech categories and case-insensitive unique names; dates (end ≥ start); unique slugs; tiers; that featured case studies have a cover and at least one result; metric shape, direction and qualifier (a `change` has no `before`); that every reference resolves inside the file (or to one of the 6 existing image assets, confirmed against production through the read API); exactly 3 hero results whose `resultKey` exists in the referenced case study, none picked twice; unique `_key` on every array item; no reuse of old `_id`s; exactly one `siteSettings`.
- `mapping.test.ts` (vitest): metric parsing and sign handling, tech spelling variants, role matching, Portable Text output. It also runs build + validate on the snapshot and checks that the validator's lists match the schema's options.
- `sanity schema validate`: 0 errors, 0 warnings.
- `sanity documents validate --file new-documents.ndjson` would be the official check, but it requires `sanity login`, so it wasn't run. After you log in it's read-only and safe to run (see step 3 below).

## Importing, after you approve

Run these from the repo root. They are not run as part of this change.

```sh
# 0. Log in (once)
pnpm --dir sanity exec sanity login

# 1. Back up the dataset first (writes outside the repo)
mkdir -p ~/sanity-backups
pnpm --dir sanity exec sanity dataset export production ~/sanity-backups/production-before-46.tar.gz

# 2. Confirm nothing from the new model exists yet (expect 0)
curl -s 'https://wbbntp0o.api.sanity.io/v2024-01-01/data/query/production?query=count(*%5B_type%20in%20%5B%22tech%22%2C%22role%22%2C%22caseStudy%22%2C%22faq%22%2C%22siteSettings%22%5D%5D)'

# 3. Optional: Sanity's own validator against the file (read-only)
pnpm --dir sanity exec sanity documents validate --file migrations/content-model/new-documents.ndjson --level error

# 4. Import, additive only
pnpm --dir sanity exec sanity dataset import migrations/content-model/new-documents.ndjson --dataset production --missing
```

- `--missing` skips any document whose `_id` already exists, so the import only adds. It never replaces or deletes, and the old `experience`, `project`, `qa` and `skillCategory` documents stay. Because the ids come from `ids.json`, re-running the same import is a no-op.
- Don't use `--replace`.
- Relative paths after `pnpm --dir sanity exec` resolve from `sanity/`.
- If you edit `content.ts` after approving, rebuild and re-validate before importing. The ids stay the same.

**After the import:** open the Studio and check a featured case study and Site Settings. The hero result picker validates against the published case study, so it only goes green after the import. Then do the manual pass (featured summaries, approach trimming, covers) and move on to #47.
