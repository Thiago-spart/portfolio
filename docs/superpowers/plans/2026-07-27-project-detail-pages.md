# Project Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project its own page at `/projects/$slug`, built around a scroll-driven expanding video/image hero adapted from a Next.js reference component, followed by project details (description, tech stack, links, gallery).

**Architecture:** New Sanity `video` file field + extended `SanityProject` type + a new `fetchProjectBySlug` query feed a new TanStack Router file route (`src/routes/projects.$slug.tsx`). The route composes two new presentational components — `ProjectHero` (the adapted scroll-expansion hero, video-first with an image fallback) and `ProjectDetails` (description/status/tech/links/gallery) — and the existing `ProjectCard` becomes the entry point via a `Link`.

**Tech Stack:** TanStack Start/Router (file-based routing), React 19, Tailwind CSS v4, TypeScript (strict, `verbatimModuleSyntax`), Sanity (content + file assets), Vitest + Testing Library, `framer-motion` (new dependency).

## Global Constraints

- Package manager is `pnpm`. Use `pnpm add`, `pnpm vitest run`, `pnpm exec tsc --noEmit`.
- Path alias `#/*` → `./src/*` (see `tsconfig.json` / `package.json` `imports`). Use it in all new source files, matching existing files.
- `verbatimModuleSyntax: true` — any import that is only used as a type must use `import type { ... }` (or an inline `type` specifier). Mixing a value and a type from the same module is fine as `import { value, type TheType } from '...'`.
- `strict`, `noUnusedLocals`, `noUnusedParameters` are on — no dead imports/vars.
- Existing i18n: `Lang = 'en' | 'pt' | 'es'`, `useTranslation()` returns `{ t, lang }`, `t(key: keyof typeof en)`. New keys must be added to **all three** of `src/i18n/locales/{en,pt,es}.json` or `t()` silently returns the raw key string.
- Existing color/type tokens (see `design.md` and `src/styles.css`): `--electric-blue` (`#00aaff`), `--near-black` (`#050508`), `--cyan-white` (`#c8f0ff`), display font is `Bebas Neue` (`font-['Bebas_Neue']`), body copy uses low-opacity white (`text-[rgba(255,255,255,0.7…0.75)]`). Match this palette instead of introducing new colors.
- Route files use flat dot-notation (see `src/routes/index.tsx`, `src/routes/__root.tsx`) — no nested folders.
- After adding/changing a route file, run `pnpm generate-routes` so `src/routeTree.gen.ts` picks it up (required before TypeScript will recognize the new route for `Link`/`useLoaderData` typing).
- Test convention: Testing Library + Vitest, files in `src/test/`, run via `pnpm vitest run <path>`. Components that render a TanStack `<Link>` need a real (in-memory) router in the test, not just a bare `render()` — see Task 5 for the pattern (already established in `src/test/Header.test.tsx`).

---

### Task 1: Data layer — Sanity schema, types, and slug query

**Files:**
- Modify: `sanity/schemas/project.ts`
- Modify: `src/types/sanity.ts`
- Modify: `src/lib/queries/projects.ts`
- Modify: `src/test/ProjectCard.test.tsx` (mock fixture only — add newly-required fields)
- Modify: `src/test/ProjectsSection.test.tsx` (mock fixtures only — add newly-required fields)

**Interfaces:**
- Produces: `SanityProject` gains `longDescription: LocaleString`, `videoUrl?: string`, `galleryUrls?: string[]`, `liveUrl?: string`, `githubUrl?: string`, `startDate: string`, `endDate: string | null`.
- Produces: `fetchProjectBySlug(slug: string): Promise<SanityProject | null>` in `src/lib/queries/projects.ts`.
- Consumed by: Task 3 (`ProjectDetails`), Task 4 (route loader), Task 5 (`ProjectCard` slug link).

This task has no new automated tests of its own (the existing `src/lib/queries/*.ts` files aren't unit tested — they're thin Sanity fetch wrappers). Verification is via `tsc` and the existing suite staying green.

- [ ] **Step 1: Add the `video` field to the Sanity schema**

Edit `sanity/schemas/project.ts`, adding the new field after `gallery`:

```ts
    { name: 'gallery',          title: 'Gallery',           type: 'array', of: [{ type: 'image' }] },
    { name: 'video',            title: 'Video',             type: 'file', options: { accept: 'video/*' } },
```

- [ ] **Step 2: Extend `SanityProject` in `src/types/sanity.ts`**

Replace the existing `SanityProject` interface with:

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

- [ ] **Step 3: Add `fetchProjectBySlug` in `src/lib/queries/projects.ts`**

Replace the file contents with:

```ts
import { sanityClient } from '#/lib/sanity'
import type { SanityProject } from '#/types/sanity'

const query = `*[_type == "project"] | order(startDate desc) {
  _id,
  title,
  slug,
  shortDescription,
  "coverImageUrl": coverImage.asset->url,
  techStack,
  category,
  status,
  featured
}`

export function fetchProjects(): Promise<SanityProject[]> {
  return sanityClient.fetch(query)
}

const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  "coverImageUrl": coverImage.asset->url,
  "videoUrl": video.asset->url,
  "galleryUrls": gallery[].asset->url,
  techStack,
  category,
  liveUrl,
  githubUrl,
  startDate,
  endDate,
  status,
  featured
}`

export function fetchProjectBySlug(slug: string): Promise<SanityProject | null> {
  return sanityClient.fetch(detailQuery, { slug })
}
```

- [ ] **Step 4: Fix the now-broken mock fixtures**

Extending `SanityProject` with required `longDescription`/`startDate`/`endDate` means the existing mock objects in `src/test/ProjectCard.test.tsx` and `src/test/ProjectsSection.test.tsx` no longer satisfy the type. Patch them minimally (Task 5 will rewrite these files more thoroughly for router wrapping — this step just keeps the suite compiling/passing in the meantime).

In `src/test/ProjectCard.test.tsx`, change:

```ts
const mockProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  coverImageUrl: 'https://example.com/cover.jpg',
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  featured: true,
}
```

to:

```ts
const mockProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  longDescription: {
    en: 'A deep dive into building the personal site.',
    pt: 'Um mergulho profundo na construção do site pessoal.',
    es: 'Una inmersión profunda en la construcción del sitio personal.',
  },
  coverImageUrl: 'https://example.com/cover.jpg',
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  startDate: '2024-01-15',
  endDate: null,
  featured: true,
}
```

In `src/test/ProjectsSection.test.tsx`, add the same three fields (`longDescription`, `startDate`, `endDate: null`) to each of the three entries in `mockProjects` (`proj-1`, `proj-2`, `proj-3`), using any reasonable per-language text and a `startDate` string.

- [ ] **Step 5: Verify the suite still compiles and passes**

Run: `pnpm exec tsc --noEmit && pnpm vitest run`
Expected: no type errors, all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add sanity/schemas/project.ts src/types/sanity.ts src/lib/queries/projects.ts src/test/ProjectCard.test.tsx src/test/ProjectsSection.test.tsx
git commit -m "feat: add video field and detail-page query for projects"
```

---

### Task 2: `ProjectHero` component (adapted scroll-expansion hero)

**Files:**
- Create: `src/components/ProjectHero.tsx`
- Test: `src/test/ProjectHero.test.tsx`
- Modify: `package.json` / `pnpm-lock.yaml` (via `pnpm add`)

**Interfaces:**
- Produces:
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
  export default function ProjectHero(props: ProjectHeroProps): JSX.Element
  ```
- Consumed by: Task 4 (the `/projects/$slug` route component).
- Renders `data-testid="project-hero-video"` when `videoSrc` is set, `data-testid="project-hero-image"` otherwise (never both).

- [ ] **Step 1: Install `framer-motion`**

Run: `pnpm add framer-motion`

- [ ] **Step 2: Write the failing tests**

Create `src/test/ProjectHero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectHero from '../components/ProjectHero'

describe('ProjectHero', () => {
  it('splits the title into a first word and the rest, rendered separately', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site Rebuild"
        date="Jan 2024 — Present"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Site Rebuild')).toBeInTheDocument()
  })

  it('renders the date and scroll hint text', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024 — Present"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByText('Jan 2024 — Present')).toBeInTheDocument()
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument()
  })

  it('renders the image-expansion variant when videoSrc is absent', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByTestId('project-hero-image')).toBeInTheDocument()
    expect(screen.queryByTestId('project-hero-video')).not.toBeInTheDocument()
  })

  it('renders the video variant when videoSrc is present', () => {
    render(
      <ProjectHero
        videoSrc="https://example.com/demo.mp4"
        posterSrc="https://example.com/cover.jpg"
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByTestId('project-hero-video')).toBeInTheDocument()
    expect(screen.queryByTestId('project-hero-image')).not.toBeInTheDocument()
  })

  it('renders children content in the section below the hero', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      >
        <p>Overview text</p>
      </ProjectHero>,
    )
    expect(screen.getByText('Overview text')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm vitest run src/test/ProjectHero.test.tsx`
Expected: FAIL — `Cannot find module '../components/ProjectHero'`.

- [ ] **Step 4: Implement `ProjectHero`**

Create `src/components/ProjectHero.tsx`:

```tsx
import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ProjectHeroProps {
  videoSrc?: string
  posterSrc?: string
  bgImageSrc: string
  title: string
  date: string
  scrollToExpand: string
  children?: ReactNode
}

export default function ProjectHero({
  videoSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ProjectHeroProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isMobileState, setIsMobileState] = useState(false)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollDelta = e.deltaY * 0.0009
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return

      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005
        const scrollDelta = deltaY * scrollFactor
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }

        setTouchStartY(touchY)
      }
    }

    const handleTouchEnd = () => {
      setTouchStartY(0)
    }

    const handleScroll = () => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollProgress, mediaFullyExpanded, touchStartY])

  useEffect(() => {
    const checkIfMobile = () => setIsMobileState(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400)
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150)

  const firstWord = title.split(' ')[0]
  const restOfTitle = title.split(' ').slice(1).join(' ')

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start">
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center">
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img src={bgImageSrc} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(5,5,8,0.6)]" />
          </motion.div>

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-start px-6">
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center">
              <div
                data-testid="project-hero-media"
                className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0 0 50px rgba(0,170,255,0.25)',
                }}
              >
                {videoSrc ? (
                  <video
                    data-testid="project-hero-video"
                    src={videoSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    data-testid="project-hero-image"
                    src={bgImageSrc}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-[rgba(5,5,8,0.3)]"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4 text-center">
                <motion.h2
                  className="font-['Bebas_Neue'] text-4xl tracking-wider text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-center font-['Bebas_Neue'] text-4xl tracking-wider text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
                <p
                  className="text-sm text-[var(--electric-blue,#00aaff)]"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {date}
                </p>
                <p
                  className="text-sm font-medium text-[var(--electric-blue,#00aaff)]"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {scrollToExpand}
                </p>
              </div>
            </div>

            <motion.section
              className="flex w-full flex-col px-2 py-10 md:px-8 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run src/test/ProjectHero.test.tsx`
Expected: PASS (all 5 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/ProjectHero.tsx src/test/ProjectHero.test.tsx
git commit -m "feat: add ProjectHero scroll-expansion component"
```

---

### Task 3: `ProjectDetails` component + i18n keys

**Files:**
- Create: `src/components/ProjectDetails.tsx`
- Test: `src/test/ProjectDetails.test.tsx`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/es.json`

**Interfaces:**
- Consumes: `SanityProject`, `Lang` from `#/types/sanity` (Task 1). `useTranslation()` from `#/i18n/useTranslation`.
- Produces:
  ```ts
  interface ProjectDetailsProps {
    project: SanityProject
    lang: Lang
  }
  export default function ProjectDetails(props: ProjectDetailsProps): JSX.Element
  ```
- Consumed by: Task 4 (route component, as `children` of `ProjectHero`).

- [ ] **Step 1: Add i18n keys to all three locale files**

In `src/i18n/locales/en.json`, add (after `"projects.empty"`):

```json
  "project.back": "Back to projects",
  "project.liveUrl": "Live site",
  "project.sourceCode": "Source code",
  "project.gallery": "Gallery",
  "project.scrollHint": "Scroll to explore",
  "project.status.completed": "Completed",
  "project.status.in-progress": "In progress",
  "project.status.archived": "Archived"
```

In `src/i18n/locales/pt.json`, add the equivalents:

```json
  "project.back": "Voltar aos projetos",
  "project.liveUrl": "Site ao vivo",
  "project.sourceCode": "Código-fonte",
  "project.gallery": "Galeria",
  "project.scrollHint": "Role para explorar",
  "project.status.completed": "Concluído",
  "project.status.in-progress": "Em andamento",
  "project.status.archived": "Arquivado"
```

In `src/i18n/locales/es.json`, add:

```json
  "project.back": "Volver a proyectos",
  "project.liveUrl": "Sitio en vivo",
  "project.sourceCode": "Código fuente",
  "project.gallery": "Galería",
  "project.scrollHint": "Desplázate para explorar",
  "project.status.completed": "Completado",
  "project.status.in-progress": "En progreso",
  "project.status.archived": "Archivado"
```

(Remember each JSON file must stay valid — add a trailing comma after the previous last key, and no trailing comma after the new last key.)

- [ ] **Step 2: Write the failing tests**

Create `src/test/ProjectDetails.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ProjectDetails from '../components/ProjectDetails'
import type { SanityProject } from '../types/sanity'

const baseProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  longDescription: {
    en: 'A deep dive into the personal site build.',
    pt: 'Um mergulho profundo na construção do site pessoal.',
    es: 'Una inmersión profunda en la construcción del sitio personal.',
  },
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  startDate: '2024-01-15',
  endDate: '2024-06-01',
  featured: true,
}

function renderDetails(project: SanityProject) {
  return render(
    <LanguageProvider>
      <ProjectDetails project={project} lang="en" />
    </LanguageProvider>,
  )
}

describe('ProjectDetails', () => {
  it('renders the long description for the active language', () => {
    renderDetails(baseProject)
    expect(screen.getByText('A deep dive into the personal site build.')).toBeInTheDocument()
  })

  it('renders the localized status label', () => {
    renderDetails(baseProject)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders a formatted date range when endDate is set', () => {
    renderDetails(baseProject)
    expect(screen.getByText(/jan 2024/i)).toBeInTheDocument()
    expect(screen.getByText(/jun 2024/i)).toBeInTheDocument()
  })

  it('renders "Present" when endDate is null', () => {
    renderDetails({ ...baseProject, endDate: null })
    expect(screen.getByText(/present/i)).toBeInTheDocument()
  })

  it('renders a tech chip for each techStack entry', () => {
    renderDetails(baseProject)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('does not render live/source links when absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Live site')).not.toBeInTheDocument()
    expect(screen.queryByText('Source code')).not.toBeInTheDocument()
  })

  it('renders the live and source links when present', () => {
    renderDetails({
      ...baseProject,
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/repo',
    })
    expect(screen.getByRole('link', { name: /live site/i })).toHaveAttribute(
      'href',
      'https://example.com',
    )
    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      'https://github.com/example/repo',
    )
  })

  it('does not render a gallery section when galleryUrls is absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Gallery')).not.toBeInTheDocument()
  })

  it('renders gallery images when galleryUrls is present', () => {
    renderDetails({
      ...baseProject,
      galleryUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    })
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm vitest run src/test/ProjectDetails.test.tsx`
Expected: FAIL — `Cannot find module '../components/ProjectDetails'`.

- [ ] **Step 4: Implement `ProjectDetails`**

Create `src/components/ProjectDetails.tsx`:

```tsx
import { ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import type { Lang, SanityProject } from '#/types/sanity'

interface ProjectDetailsProps {
  project: SanityProject
  lang: Lang
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

export default function ProjectDetails({ project, lang }: ProjectDetailsProps) {
  const { t } = useTranslation()
  const endLabel = project.endDate ? formatDate(project.endDate) : t('timeline.present')

  return (
    <div className="mx-auto max-w-3xl text-left">
      <p className="text-sm text-[rgba(255,255,255,0.75)]">{project.longDescription[lang]}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-[var(--electric-blue,#00aaff)] uppercase">
        <span>{t(`project.status.${project.status}`)}</span>
        <span aria-hidden="true">•</span>
        <span>
          {formatDate(project.startDate)} — {endLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#00aaff] px-4 py-2 text-sm font-semibold text-[#c8f0ff] no-underline"
            >
              <ExternalLink size={16} aria-hidden="true" />
              {t('project.liveUrl')}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.3)] px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17v3.21c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
              {t('project.sourceCode')}
            </a>
          )}
        </div>
      )}

      {project.galleryUrls && project.galleryUrls.length > 0 && (
        <div className="mt-10">
          <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide text-white">
            {t('project.gallery')}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.galleryUrls.map((url) => (
              <img key={url} src={url} alt="" className="w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run src/test/ProjectDetails.test.tsx`
Expected: PASS (all 9 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectDetails.tsx src/test/ProjectDetails.test.tsx src/i18n/locales/en.json src/i18n/locales/pt.json src/i18n/locales/es.json
git commit -m "feat: add ProjectDetails content section and i18n keys"
```

---

### Task 4: `/projects/$slug` route

**Files:**
- Create: `src/routes/projects.$slug.tsx`

**Interfaces:**
- Consumes: `fetchProjectBySlug` (Task 1), `ProjectHero` (Task 2), `ProjectDetails` (Task 3), `routeHead` from `#/lib/seo`, `useLanguage` from `#/i18n/LanguageContext`, `useTranslation` from `#/i18n/useTranslation`.
- Produces: the route itself — no other task consumes exports from this file. Not unit tested directly, matching the existing convention where `src/routes/index.tsx` also has no dedicated test file (its composed sections are tested individually, which is what Tasks 2–3 already did).

- [ ] **Step 1: Create the route file**

Create `src/routes/projects.$slug.tsx`:

```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchProjectBySlug } from '#/lib/queries/projects'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { routeHead } from '#/lib/seo'
import ProjectHero from '#/components/ProjectHero'
import ProjectDetails from '#/components/ProjectDetails'

function formatHeroDate(startDate: string, endDate: string | null, presentLabel: string): string {
  const format = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', year: 'numeric' })
  return `${format(startDate)} — ${endDate ? format(endDate) : presentLabel}`
}

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const project = await fetchProjectBySlug(params.slug)
    if (!project) throw notFound()
    return { project }
  },
  head: ({ loaderData }) =>
    routeHead({
      title: `${loaderData!.project.title.en} — Thiago Souza`,
      description: loaderData!.project.shortDescription.en,
      path: `/projects/${loaderData!.project.slug.current}`,
    }),
  notFoundComponent: ProjectNotFound,
  component: ProjectPage,
})

function ProjectNotFound() {
  return (
    <main className="cyberpunk-surface flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-['Bebas_Neue'] text-3xl tracking-wider text-white">Project not found</p>
      <a href="/#projects" className="text-sm font-semibold text-[var(--electric-blue,#00aaff)]">
        ← Back to projects
      </a>
    </main>
  )
}

function ProjectPage() {
  const { project } = Route.useLoaderData()
  const { lang } = useLanguage()
  const { t } = useTranslation()

  return (
    <main>
      <ProjectHero
        videoSrc={project.videoUrl}
        posterSrc={project.coverImageUrl}
        bgImageSrc={project.coverImageUrl ?? ''}
        title={project.title[lang]}
        date={formatHeroDate(project.startDate, project.endDate, t('timeline.present'))}
        scrollToExpand={t('project.scrollHint')}
      >
        <ProjectDetails project={project} lang={lang} />
      </ProjectHero>
      <div className="px-6 pb-16 text-center">
        <a href="/#projects" className="text-sm font-semibold text-[var(--electric-blue,#00aaff)]">
          ← {t('project.back')}
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Regenerate the route tree**

Run: `pnpm generate-routes`
Expected: `src/routeTree.gen.ts` is updated to include a `/projects/$slug` entry (check `git diff src/routeTree.gen.ts` shows the new route registered).

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. This confirms `Route.useLoaderData()`, the `head()` callback's `loaderData` typing, and the `ProjectHero`/`ProjectDetails` prop types all line up.

- [ ] **Step 4: Manually verify in the dev server**

Run: `pnpm dev` and, with at least one project in Sanity that has a `slug`, visit `http://localhost:3000/projects/<that-slug>` — confirm the hero renders (image fallback is fine if no video is uploaded yet) and the details section appears once scrolled/expanded. Visit a bogus slug (e.g. `/projects/does-not-exist`) and confirm the not-found message renders instead of a crash. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/routes/projects.$slug.tsx src/routeTree.gen.ts
git commit -m "feat: add /projects/\$slug detail route"
```

---

### Task 5: Wire `ProjectCard` to the detail page

**Files:**
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/test/ProjectCard.test.tsx` (full rewrite — router wrapping)
- Modify: `src/test/ProjectsSection.test.tsx` (full rewrite — router wrapping)

**Interfaces:**
- Consumes: the `/projects/$slug` route registered in Task 4 (required for `<Link to="/projects/$slug">` to type-check against the generated route tree).
- No new exports — this task only changes `ProjectCard`'s rendered root element from `<div>` to `<Link>`.

- [ ] **Step 1: Update the failing tests first (router-aware `ProjectCard.test.tsx`)**

Replace the full contents of `src/test/ProjectCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import ProjectCard from '../components/ProjectCard'
import type { Lang, SanityProject } from '../types/sanity'

const mockProject: SanityProject = {
  _id: 'proj-1',
  title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
  slug: { current: 'portfolio-site' },
  shortDescription: {
    en: 'A personal site.',
    pt: 'Um site pessoal.',
    es: 'Un sitio personal.',
  },
  longDescription: {
    en: 'A deep dive into building the personal site.',
    pt: 'Um mergulho profundo na construção do site pessoal.',
    es: 'Una inmersión profunda en la construcción del sitio personal.',
  },
  coverImageUrl: 'https://example.com/cover.jpg',
  techStack: ['React', 'TypeScript'],
  category: 'web',
  status: 'completed',
  startDate: '2024-01-15',
  endDate: null,
  featured: true,
}

async function renderCard(project: SanityProject, lang: Lang, accentIndex: number) {
  const rootRoute = createRootRoute({
    component: () => <ProjectCard project={project} lang={lang} accentIndex={accentIndex} />,
  })
  const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects/$slug',
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([projectRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

describe('ProjectCard', () => {
  it('renders the title for the active language', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
  })

  it('renders the short description for the active language', async () => {
    await renderCard(mockProject, 'pt', 0)
    expect(screen.getByText('Um site pessoal.')).toBeInTheDocument()
  })

  it('renders a tech chip for each techStack entry', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('applies glitch-flicker to the title', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByText('Portfolio Site')).toHaveClass('glitch-flicker')
  })

  it('renders the image layer when coverImageUrl is present', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByTestId('project-card-image')).toBeInTheDocument()
  })

  it('falls back to the cyberpunk-surface background when coverImageUrl is missing', async () => {
    const projectWithoutImage: SanityProject = { ...mockProject, coverImageUrl: undefined }
    await renderCard(projectWithoutImage, 'en', 1)
    expect(screen.getByTestId('project-card-fallback')).toBeInTheDocument()
  })

  it('links to the project detail page for its slug', async () => {
    await renderCard(mockProject, 'en', 0)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/portfolio-site')
  })
})
```

- [ ] **Step 2: Run the tests to verify the new one fails**

Run: `pnpm vitest run src/test/ProjectCard.test.tsx`
Expected: FAIL on `'links to the project detail page for its slug'` — no `link` role exists yet (the card root is still a `div`).

- [ ] **Step 3: Update `ProjectCard.tsx` to link to the detail page**

Replace the full contents of `src/components/ProjectCard.tsx`:

```tsx
import { Link } from '@tanstack/react-router'
import type { Lang, SanityProject } from '#/types/sanity'

interface ProjectCardProps {
  project: SanityProject
  lang: Lang
  accentIndex: number
}

const ACCENT_COLORS = ['#00aaff', '#7b2fff', '#ff6a00']

export default function ProjectCard({ project, lang, accentIndex }: ProjectCardProps) {
  const accent = ACCENT_COLORS[accentIndex % ACCENT_COLORS.length]
  const hasImage = Boolean(project.coverImageUrl)

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug.current }}
      className="group relative block h-72 w-full overflow-hidden rounded-2xl"
      style={
        !hasImage
          ? { border: `2px solid ${accent}`, boxShadow: `0 0 20px ${accent}33 inset` }
          : undefined
      }
    >
      {hasImage ? (
        <div
          data-testid="project-card-image"
          className="absolute inset-0 saturate-0 transition-all duration-500 group-hover:scale-110 group-hover:saturate-100"
          style={{
            backgroundImage: `url(${project.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <div data-testid="project-card-fallback" className="cyberpunk-surface absolute inset-0" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,8,0.9)] via-[rgba(5,5,8,0.3)] to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5">
        <h3 className="glitch-flicker font-['Bebas_Neue'] text-2xl tracking-wide text-white transition-colors group-hover:text-electric-blue">
          {project.title[lang]}
        </h3>
        <p className="line-clamp-3 text-sm text-[rgba(255,255,255,0.75)]">
          {project.shortDescription[lang]}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/test/ProjectCard.test.tsx`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Update `ProjectsSection.test.tsx` for router wrapping**

`ProjectsSection` renders real `ProjectCard`s, which now require router context. Replace the full contents of `src/test/ProjectsSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from '@tanstack/react-router'
import { LanguageProvider } from '../i18n/LanguageContext'
import ProjectsSection from '../components/ProjectsSection'
import type { SanityProject } from '../types/sanity'

const mockProjects: SanityProject[] = [
  {
    _id: 'proj-1',
    title: { en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' },
    slug: { current: 'portfolio-site' },
    shortDescription: {
      en: 'A personal site.',
      pt: 'Um site pessoal.',
      es: 'Un sitio personal.',
    },
    longDescription: {
      en: 'A deep dive into building the personal site.',
      pt: 'Um mergulho profundo na construção do site pessoal.',
      es: 'Una inmersión profunda en la construcción del sitio personal.',
    },
    coverImageUrl: 'https://example.com/cover.jpg',
    techStack: ['React'],
    category: 'web',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: null,
    featured: true,
  },
  {
    _id: 'proj-2',
    title: { en: 'API Service', pt: 'Serviço API', es: 'Servicio API' },
    slug: { current: 'api-service' },
    shortDescription: {
      en: 'A backend service.',
      pt: 'Um serviço de backend.',
      es: 'Un servicio backend.',
    },
    longDescription: {
      en: 'Notes on building the backend service.',
      pt: 'Notas sobre a construção do serviço de backend.',
      es: 'Notas sobre la construcción del servicio backend.',
    },
    techStack: ['Node.js'],
    category: 'api',
    status: 'in-progress',
    startDate: '2024-03-01',
    endDate: null,
    featured: false,
  },
  {
    _id: 'proj-3',
    title: { en: 'Sparse Project', pt: 'Projeto Simples', es: 'Proyecto Simple' },
    slug: { current: 'sparse-project' },
    shortDescription: {
      en: 'A project with no tech chips.',
      pt: 'Um projeto sem chips de tecnologia.',
      es: 'Un proyecto sin chips de tecnología.',
    },
    longDescription: {
      en: 'A minimal project used to exercise the empty-state paths.',
      pt: 'Um projeto mínimo usado para testar os estados vazios.',
      es: 'Un proyecto mínimo usado para probar los estados vacíos.',
    },
    techStack: [],
    category: 'web',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2023-12-01',
    featured: false,
  },
]

async function renderSection(projects: SanityProject[]) {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <ProjectsSection projects={projects} lang="en" />
      </LanguageProvider>
    ),
  })
  const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects/$slug',
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([projectRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

describe('ProjectsSection', () => {
  it('has the #projects anchor with the cyberpunk-surface background class', async () => {
    const { container } = await renderSection(mockProjects)
    expect(container.querySelector('#projects')).toHaveClass('cyberpunk-surface')
  })

  it('renders a card for each project, including one with no tech chips', async () => {
    await renderSection(mockProjects)
    expect(screen.getByText('Portfolio Site')).toBeInTheDocument()
    expect(screen.getByText('API Service')).toBeInTheDocument()
    expect(screen.getByText('Sparse Project')).toBeInTheDocument()
  })

  it('renders the empty state when there are no projects', async () => {
    await renderSection([])
    expect(screen.getByText('No projects yet — check back soon.')).toBeInTheDocument()
  })

  it('renders the dot-indicator container without crashing when Embla reports zero snaps', async () => {
    // jsdom performs no real layout, so Embla's scrollSnapList() never populates
    // here (it stays permanently empty, unlike a real browser). This exercises
    // the snapCount === 0 path — Array.from({ length: 0 }) — confirming the
    // component renders gracefully (no dots) instead of throwing.
    const { container } = await renderSection(mockProjects)
    const dotsContainer = container.querySelector('.mt-6.flex.justify-center.gap-2')
    expect(dotsContainer).toBeInTheDocument()
    expect(dotsContainer).toBeEmptyDOMElement()
  })
})
```

- [ ] **Step 6: Run the full suite**

Run: `pnpm vitest run`
Expected: PASS — every test file, including `ProjectCard.test.tsx` and `ProjectsSection.test.tsx`.

- [ ] **Step 7: Type-check the whole project**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/ProjectCard.tsx src/test/ProjectCard.test.tsx src/test/ProjectsSection.test.tsx
git commit -m "feat: link project cards to their detail pages"
```
