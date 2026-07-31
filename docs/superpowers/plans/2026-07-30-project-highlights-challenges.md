# Project Highlights & Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional `highlights` and `challenges` bullet-list fields to the `project` schema, surface them through the detail-page GROQ query and types, and render them (plus paragraph-split `longDescription`) on `ProjectDetails`.

**Architecture:** Two new `array of localeString` fields on the existing `project` Sanity schema. The detail-page GROQ query and `SanityProject` type gain matching optional fields. `ProjectDetails.tsx` splits `longDescription` on blank lines into multiple `<p>`s and renders `highlights`/`challenges` as `<ul>` lists, each gated on the array being present and non-empty so existing project documents without this content render unchanged.

**Tech Stack:** Sanity schema (`sanity/schemas/project.ts`), GROQ (`src/lib/queries/projects.ts`), TypeScript types (`src/types/sanity.ts`), React (`src/components/ProjectDetails.tsx`), Vitest + Testing Library (`src/test/ProjectDetails.test.tsx`), flat-JSON i18n (`src/i18n/locales/*.json`).

## Global Constraints

- `highlights` and `challenges` are both optional (no `Rule.required()`) — existing project documents without them must keep rendering exactly as today.
- Only `my-tanstack-app/sanity/schemas/project.ts` is edited. `studio-personal-portfolio/` is a separate, stale, unmaintained Studio repo (last touched 2026-06-30, already missing the `video` field) — do not edit it as part of this plan.
- `longDescription` stays a plain `localeText` field (no type change) — paragraph splitting happens entirely in the frontend, on blank lines (`\n\s*\n`).
- No markdown, no Portable Text — see the design doc for why.
- New i18n keys must be added to all three locale files (`en.json`, `pt.json`, `es.json`) in the same task — `t()` is typed off `en.json`'s keys (`useTranslation.ts`), so a missing `en.json` key is a compile error, but a missing `pt.json`/`es.json` key silently falls back to displaying the raw key string instead of a translation — both are defects.

---

### Task 1: Add `highlights`/`challenges` fields to the project schema

**Files:**
- Modify: `my-tanstack-app/sanity/schemas/project.ts:11-16`

**Interfaces:**
- Consumes: nothing new.
- Produces: two new Sanity fields on the `project` document type, `highlights` and `challenges`, each `array of { type: 'localeString' }` — consumed by Task 2's GROQ query.

- [ ] **Step 1: Add the fields**

In `my-tanstack-app/sanity/schemas/project.ts`, replace:

```ts
    {
      name: 'longDescription',
      title: 'Long Description',
      type: 'localeText',
      validation: (Rule: Rule) => Rule.required(),
    },
```

with:

```ts
    {
      name: 'longDescription',
      title: 'Long Description',
      type: 'localeText',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'localeString' }],
    },
    {
      name: 'challenges',
      title: 'Challenges',
      type: 'array',
      of: [{ type: 'localeString' }],
    },
```

- [ ] **Step 2: Type-check**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx tsc --noEmit`
Expected: no errors (this schema file is covered by the root tsconfig's `**/*.ts` include, and the root `package.json` already has `sanity` as a dependency, so this passes without needing anything installed in `sanity/`).

- [ ] **Step 3: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add sanity/schemas/project.ts
git commit -m "Add highlights/challenges fields to project schema"
```

---

### Task 2: Wire highlights/challenges through types, query, and i18n

**Files:**
- Modify: `my-tanstack-app/src/types/sanity.ts:46-63` (the `SanityProject` interface)
- Modify: `my-tanstack-app/src/lib/queries/projects.ts:24-41` (`detailQuery`)
- Modify: `my-tanstack-app/src/i18n/locales/en.json`, `pt.json`, `es.json`

**Interfaces:**
- Consumes: the `highlights`/`challenges` schema fields from Task 1.
- Produces: `SanityProject.highlights?: LocaleString[]`, `SanityProject.challenges?: LocaleString[]` (consumed by Task 3's frontend code), plus i18n keys `project.highlights` and `project.challenges` (consumed by Task 3's `t()` calls).

- [ ] **Step 1: Add the fields to `SanityProject`**

In `my-tanstack-app/src/types/sanity.ts`, in the `SanityProject` interface, add after `longDescription: LocaleString`:

```ts
  highlights?: LocaleString[]
  challenges?: LocaleString[]
```

So the interface reads (only the top of it shown, unchanged fields below stay as-is):

```ts
export interface SanityProject {
  _id: string
  title: LocaleString
  slug: { current: string }
  shortDescription: LocaleString
  longDescription: LocaleString
  highlights?: LocaleString[]
  challenges?: LocaleString[]
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

- [ ] **Step 2: Add the fields to the detail GROQ query**

In `my-tanstack-app/src/lib/queries/projects.ts`, replace:

```ts
const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  "coverImageUrl": coverImage.asset->url,
```

with:

```ts
const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  highlights,
  challenges,
  "coverImageUrl": coverImage.asset->url,
```

(Only `detailQuery` changes — the list `query` above it stays untouched; highlights/challenges aren't needed on `/projects` card views.)

- [ ] **Step 3: Add i18n keys**

In `my-tanstack-app/src/i18n/locales/en.json`, add after the `"project.gallery": "Gallery",` line:

```json
  "project.highlights": "Highlights",
  "project.challenges": "Challenges",
```

In `my-tanstack-app/src/i18n/locales/pt.json`, add after the `"project.gallery": "Galeria",` line:

```json
  "project.highlights": "Destaques",
  "project.challenges": "Desafios",
```

In `my-tanstack-app/src/i18n/locales/es.json`, add after the `"project.gallery": "Galería",` line:

```json
  "project.highlights": "Aspectos destacados",
  "project.challenges": "Desafíos",
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean; all existing tests still pass (no new tests in this task — the new fields aren't consumed by any component yet, so there's nothing new to assert here; Task 3 adds the tests that actually exercise them).

- [ ] **Step 5: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add src/types/sanity.ts src/lib/queries/projects.ts src/i18n/locales/en.json src/i18n/locales/pt.json src/i18n/locales/es.json
git commit -m "Wire highlights/challenges through types, query, and i18n"
```

---

### Task 3: Render paragraphs, highlights, and challenges in `ProjectDetails`

**Files:**
- Modify: `my-tanstack-app/src/components/ProjectDetails.tsx`
- Test: `my-tanstack-app/src/test/ProjectDetails.test.tsx`

**Interfaces:**
- Consumes: `SanityProject.highlights?: LocaleString[]`, `SanityProject.challenges?: LocaleString[]` from Task 2; i18n keys `project.highlights`/`project.challenges` from Task 2.
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Write the failing tests**

Add to `my-tanstack-app/src/test/ProjectDetails.test.tsx`, inside the `describe('ProjectDetails', ...)` block:

```tsx
  it('renders each blank-line-separated chunk of longDescription as its own paragraph', () => {
    renderDetails({
      ...baseProject,
      longDescription: {
        en: 'First paragraph.\n\nSecond paragraph.',
        pt: 'Primeiro parágrafo.\n\nSegundo parágrafo.',
        es: 'Primer párrafo.\n\nSegundo párrafo.',
      },
    })
    const first = screen.getByText('First paragraph.')
    const second = screen.getByText('Second paragraph.')
    expect(first.tagName).toBe('P')
    expect(second.tagName).toBe('P')
    expect(first).not.toBe(second)
  })

  it('does not render a highlights section when highlights is absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Highlights')).not.toBeInTheDocument()
  })

  it('renders a highlights list when highlights is present', () => {
    renderDetails({
      ...baseProject,
      highlights: [
        { en: 'Shipped feature A', pt: 'Lançou a funcionalidade A', es: 'Lanzó la funcionalidad A' },
        { en: 'Shipped feature B', pt: 'Lançou a funcionalidade B', es: 'Lanzó la funcionalidad B' },
      ],
    })
    expect(screen.getByText('Highlights')).toBeInTheDocument()
    expect(screen.getByText('Shipped feature A')).toBeInTheDocument()
    expect(screen.getByText('Shipped feature B')).toBeInTheDocument()
  })

  it('does not render a challenges section when challenges is absent', () => {
    renderDetails(baseProject)
    expect(screen.queryByText('Challenges')).not.toBeInTheDocument()
  })

  it('renders a challenges list when challenges is present', () => {
    renderDetails({
      ...baseProject,
      challenges: [
        { en: 'Handled tricky edge case', pt: 'Tratou um caso extremo complicado', es: 'Manejó un caso extremo complicado' },
      ],
    })
    expect(screen.getByText('Challenges')).toBeInTheDocument()
    expect(screen.getByText('Handled tricky edge case')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx vitest run src/test/ProjectDetails.test.tsx`
Expected: FAIL — the five new cases fail (single `<p>` today has no paragraph splitting, and `highlights`/`challenges` aren't rendered or typed on the props yet at the call sites, though `SanityProject` already has them as optional from Task 2 so this compiles — it just renders nothing).

- [ ] **Step 3: Implement paragraph splitting and the two list sections**

In `my-tanstack-app/src/components/ProjectDetails.tsx`, replace:

```tsx
      <p className="text-sm text-[rgba(255,255,255,0.75)]">{project.longDescription[lang]}</p>
```

with:

```tsx
      {project.longDescription[lang]
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="mt-4 text-sm text-[rgba(255,255,255,0.75)] first:mt-0">
            {paragraph}
          </p>
        ))}

      {project.highlights && project.highlights.length > 0 && (
        <div className="mt-6">
          <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide text-white">
            {t('project.highlights')}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[rgba(255,255,255,0.75)]">
            {project.highlights.map((highlight, index) => (
              <li key={index}>{highlight[lang]}</li>
            ))}
          </ul>
        </div>
      )}

      {project.challenges && project.challenges.length > 0 && (
        <div className="mt-6">
          <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide text-white">
            {t('project.challenges')}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[rgba(255,255,255,0.75)]">
            {project.challenges.map((challenge, index) => (
              <li key={index}>{challenge[lang]}</li>
            ))}
          </ul>
        </div>
      )}
```

(`t` and `lang` are already in scope — `t` comes from `useTranslation()` at the top of the component, `lang` is a prop.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx vitest run src/test/ProjectDetails.test.tsx`
Expected: PASS — all cases, including the five new ones and every pre-existing case (the pre-existing `baseProject.longDescription.en` is `'A deep dive into the personal site build.'`, a single chunk with no blank line, so it still renders as one `<p>` with that exact text).

- [ ] **Step 5: Run the full suite and type-check**

Run: `cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app && npx tsc --noEmit && npx vitest run`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
cd /home/loki/www/work/personal-projects/thiago_portifolio/my-tanstack-app
git add src/components/ProjectDetails.tsx src/test/ProjectDetails.test.tsx
git commit -m "Render longDescription paragraphs, highlights, and challenges"
```
