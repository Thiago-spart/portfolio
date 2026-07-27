# Project Detail Pages — Design Spec

Date: 2026-07-27

## Summary

Each project gets its own page at `/projects/$slug`, built around an adapted
version of the "scroll-expansion-hero" component: a video (or image, as
fallback) that expands to fill the viewport as the visitor scrolls, followed
by project details (description, tech stack, links, gallery). No separate
`/projects` index/listing page is in scope — entry points are the existing
homepage carousel cards.

## Out of scope

- A `/projects` listing/index page.
- A site-wide 404 redesign (only this route gets a scoped `notFoundComponent`).
- Non-video media types (audio, PDFs, etc).

## Data layer

### Sanity schema (`sanity/schemas/project.ts`)

Add one field:

```ts
{ name: 'video', title: 'Video', type: 'file', options: { accept: 'video/*' } }
```

Every project is expected to eventually have a video, but the system must
tolerate projects that don't yet (see Fallback behavior below).

### Types (`src/types/sanity.ts`)

Extend `SanityProject` with the fields the schema already defines but the
current query doesn't fetch:

```ts
export interface SanityProject {
  _id: string
  title: LocaleString
  slug: { current: string }
  shortDescription: LocaleString
  longDescription: LocaleString
  coverImageUrl?: string
  videoUrl?: string
  galleryUrls?: string[]
  techStack: string[]
  category: 'web' | 'mobile' | 'api' | 'other'
  liveUrl?: string
  githubUrl?: string
  startDate: string
  endDate: string | null
  status: 'completed' | 'in-progress' | 'archived'
  featured: boolean
}
```

### Queries (`src/lib/queries/projects.ts`)

Keep the existing `fetchProjects()` lean (homepage carousel doesn't need
long description, gallery, or video). Add a new function:

```ts
const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id, title, slug, shortDescription, longDescription,
  "coverImageUrl": coverImage.asset->url,
  "videoUrl": video.asset->url,
  "galleryUrls": gallery[].asset->url,
  techStack, category, liveUrl, githubUrl,
  startDate, endDate, status, featured
}`

export function fetchProjectBySlug(slug: string): Promise<SanityProject | null> {
  return sanityClient.fetch(detailQuery, { slug })
}
```

## Routing

- New file: `src/routes/projects.$slug.tsx` → resolves to path `/projects/$slug`
  (flat dot-notation, consistent with the existing `__root.tsx`/`index.tsx`
  files — no new folder).
- `loader` calls `fetchProjectBySlug(params.slug)`. If the result is `null`,
  throw TanStack Router's `notFound()`.
- `notFoundComponent` on this route only: a simple "Project not found"
  message with a link back to `/`.
- `head()` uses the existing `routeHead()` helper:
  `routeHead({ title: project.title[lang], description: project.shortDescription[lang], path: '/projects/${slug}' })`.
  Note: `routeHead` doesn't currently accept a `lang` parameter — the route
  component reads `lang` from `useLanguage()` same as the homepage does, and
  passes the localized strings into `routeHead`.

### Entry point

`ProjectCard` (`src/components/ProjectCard.tsx`) wraps its root `div` in a
TanStack `<Link to="/projects/$slug" params={{ slug: project.slug.current }}>`
so homepage carousel cards become clickable through to the detail page.

## Hero component

New file: `src/components/ProjectHero.tsx` — adapted from the pasted
`scroll-expansion-hero.tsx` / Next.js reference. This is a page-specific
feature component, not a generic shadcn primitive, so it lives alongside
`ProjectsSection`/`HeroSection` in `src/components/`, not `src/components/ui/`.

Adaptations from the reference implementation:

- Remove `'use client'` (no Next.js App Router directive needed).
- Replace `next/image` `<Image>` with a plain `<img>` — no Next.js image
  optimizer in this stack.
- Add `framer-motion` as a new npm dependency (currently unused in this repo).
- Keep the scroll-jacking wheel/touch/expansion logic verbatim, including
  the mobile touch handling and `isMobileState` responsive sizing — this
  matches the reference design faithfully per explicit decision.
- Video handling: always rendered `autoPlay muted loop playsInline`, no
  controls. Drop the YouTube-iframe branch from the reference entirely —
  video always comes from a Sanity file asset, so it's always a direct
  `<video src>`, never a `youtube.com` URL.
- **Fallback**: if `videoUrl` is absent, render the image-expansion variant
  using `coverImageUrl` in place of video. This is a prop-level fallback in
  the component (`mediaType` is derived from whether `videoUrl` exists, not
  a separate prop the caller sets manually).
- Restyle to the site's existing cyberpunk design tokens instead of the
  reference's generic blue/black demo styling:
  - Title: `font-['Bebas_Neue'] tracking-wider text-white` (matches
    `ProjectsSection`'s heading treatment) instead of generic bold sans.
  - Accent text (date, "scroll to expand" hint): `text-electric-blue` /
    `text-[var(--cyan-white)]` instead of `text-blue-200`.
  - Background dim overlay consistent with the `cyberpunk-surface` look
    used elsewhere.

Props (mirrors the reference's `ScrollExpandMediaProps`, minus `mediaType`
which becomes derived):

```ts
interface ProjectHeroProps {
  videoSrc?: string
  posterSrc?: string
  bgImageSrc: string
  title: string
  date: string
  scrollToExpand: string
  children?: ReactNode
}
```

## Page content (below the hero)

The route's page component renders, as `children` passed into `ProjectHero`,
in this order:

1. **Overview** — `longDescription[lang]`.
2. **Meta row** — status badge (`completed` / `in-progress` / `archived`,
   localized label) and date range: `startDate`–`endDate`, or `startDate`–
   "Present" (localized) when `endDate` is `null`.
3. **Tech stack** — badge pills, same visual treatment as the tech pills in
   `ProjectCard` (rounded-full border pills).
4. **Links** — Live URL / GitHub URL as icon buttons using `lucide-react`'s
   `ExternalLink` / `Github` icons. Each only renders if the corresponding
   URL is present on the project.
5. **Gallery** — grid of `galleryUrls` images, rendered only if the array is
   non-empty, placed after the main content block.

## i18n & SEO

Add the following keys to all three locale files (`en.json`, `pt.json`,
`es.json`):

- `project.back` — "Back to projects" (or equivalent), links to `/`.
- `project.liveUrl` — label for the live-site link.
- `project.sourceCode` — label for the GitHub link.
- `project.gallery` — gallery section heading.
- `project.status.completed` / `project.status.in-progress` /
  `project.status.archived` — localized status labels.
- `project.present` — localized "Present" label for open-ended date ranges.

SEO: per-project `head()` via `routeHead()` as described in Routing, giving
each project page a distinct title/description/canonical instead of
inheriting the homepage's.

## Testing

- New test file `src/test/ProjectHero.test.tsx`: renders title/date, falls
  back to the image-expansion variant when `videoSrc` is absent, verifies
  the video variant renders when `videoSrc` is present.
- New test file (or extend route test conventions) for the `/projects/$slug`
  page component: renders live/GitHub links only when present, renders
  gallery only when `galleryUrls` is non-empty, renders status/date-range
  meta row correctly (including the "Present" case).
- Update `src/test/ProjectCard.test.tsx` to assert the card links to
  `/projects/$slug` with the correct `slug` param.

Follows the existing patterns already established in `src/test/`.
