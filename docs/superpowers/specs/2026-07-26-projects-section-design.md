# Projects Section (Home) — Carousel

## Problem

The homepage has no Projects section yet. `nav.projects` already points to `/#projects`
(added in `2026-07-07-remove-about-add-projects-nav-design.md`) but no section with
`id="projects"` exists, so the nav link currently scrolls nowhere. Separately,
`src/lib/queries/projects.ts` and the `SanityProject` type are fully wired to Sanity
but unused — no component reads them.

## Goal

Add a `ProjectsSection` to the home page: a carousel of project cards, each showing a
cover image, title, short description, and tech stack, with a hover animation on the
title matching the site's existing "Get in touch" button glitch effect.

## Non-goals

- No project-detail page/route. Cards are display-only (no links), per explicit
  decision — a detail page is a separate future project.
- No new Sanity schema fields (no `liveUrl`/`repoUrl`). Only existing `SanityProject`
  fields are used.
- No framer-motion or other motion library. The title hover animation reuses the
  existing CSS-only `glitch-flicker` keyframe (`styles.css:369`), not a per-letter
  framer-motion effect.
- No react-icons. `iconLibrary` in `components.json` is already `lucide`; the carousel
  arrows use `lucide-react` via shadcn's `Button`, consistent with the rest of the app
  (inline SVGs elsewhere, no icon-font dependency).

## Architecture & data flow

- `src/routes/index.tsx`: loader adds `fetchProjects()` alongside the existing
  `fetchExperiences`/`fetchQA`/`fetchSkills` calls in the same `Promise.all`. Result is
  passed as `projects` to a new `<ProjectsSection projects={projects} lang={lang} />`,
  placed between `<TimelineSection />` and `<SkillsSection />`.
- `src/components/ProjectsSection.tsx` (new): owns the section shell (`id="projects"`,
  `scroll-mt-24`, `cyberpunk-surface`, heading via `t('projects.title')` /
  `t('projects.subtitle')` — same shape as `ContactSection`'s heading block) and the
  shadcn `Carousel` wrapper. Props: `{ projects: SanityProject[]; lang: Lang }`.
- `src/components/ProjectCard.tsx` (new): renders one `SanityProject` for a given
  `lang`, sibling to `SkillCard.tsx`.
- No new Sanity fields, no new routes, no new global state.

## Card design

- Background: `coverImageUrl` as a `background-size: cover` image. If absent, falls
  back to the `cyberpunk-surface` dark background (`#050508`) with an accent
  border/glow, cycling the same hue tokens `GlowCard` already defines
  (`blue`/`purple`/`ember`) by index.
- Image gets the reference component's desaturate-by-default / full-color-on-hover
  treatment plus a slight scale-up — pure Tailwind/CSS, no JS needed.
- Overlay: title (`LocaleString`, resolved via `lang`) and `shortDescription`, laid
  over a bottom gradient scrim for legibility.
- Title hover: gets the `glitch-flicker` class on `:hover` — the same keyframe used by
  the `hero.cta.contact` button (`styles.css:369-378`). No new keyframe, no new
  dependency.
- Tech chips: small pill row for `techStack`, reusing the existing translucent
  border-pill visual language (same family as the hero badge).
- No status/category badges, no click handler, no anchor — cards are inert `div`s, per
  the "display-only" decision above.

## Carousel mechanics

1. Run `npx shadcn@latest add button carousel`. `components.json` is already correctly
   configured (aliases point at `#/components`, `#/lib/utils`, `#/hooks`), it has just
   never been used — this is the first shadcn component installed in the project. It
   adds:
   - `src/components/ui/button.tsx`, `src/components/ui/carousel.tsx`
   - `src/lib/utils.ts` (the `cn()` helper, doesn't exist yet)
   - deps: `embla-carousel-react`, `clsx`, `tailwind-merge`, `class-variance-authority`,
     `lucide-react`
2. `CarouselItem` uses `basis-full sm:basis-1/2 lg:basis-1/3` — 1 card on mobile, 2 on
   tablet, 3 on desktop ("two or three at a time" on desktop, single-card on phones).
3. Navigation: shadcn's `CarouselPrevious`/`CarouselNext`, restyled to the site's
   dark/accent look (border + glow, matching the CTA button family). A small dots row
   is added on top of Embla's API (`api.scrollTo(index)`, `api.on('select', ...)` to
   track `api.selectedScrollSnap()`) since shadcn's carousel doesn't ship dots.
4. Touch/swipe: Embla supports drag/swipe natively — this was the deciding factor for
   picking shadcn's Carousel over a hand-rolled scroll-snap implementation, since it
   needed explicit attention for mobile per the requirements.

## i18n

New keys in `en.json`, `pt.json`, `es.json`:
- `projects.title` (mirrors `contact.title` pattern)
- `projects.subtitle` (mirrors `contact.subtitle` pattern)
- `projects.empty` — shown instead of the carousel when `projects` is an empty array
  (loader returned `[]`); heading still renders.

## Testing

- `src/test/ProjectsSection.test.tsx` (new), mirroring `SkillsSection.test.tsx`:
  renders with mock `SanityProject[]`, asserts title/description render for the active
  `lang`, asserts the empty-array case renders `projects.empty` without crashing.
- Dots row gets `aria-label="Go to slide N"` per dot; section keeps the
  `aria-labelledby` heading-id pattern used by `ContactSection`.
- shadcn's Carousel already provides `role="region"` / `aria-roledescription="carousel"`
  and keyboard arrow-key navigation.

## Open items for the implementation plan

- Exact accent-hue cycling logic for missing-image fallback (by `category` vs. by
  index) — implementation detail, doesn't change the shape of the component.
- Whether `projects.empty` copy should differ across the three locales beyond direct
  translation (not a design concern).
