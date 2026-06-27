# Data & CMS Strategy — Design Spec
**Date:** 2026-06-27  
**Status:** Approved

---

## Overview

Dynamic content (projects, experiences, Q&A, skills) is managed in **Sanity CMS** with field-level localization for PT/EN/ES. UI strings (button labels, section headings, navigation text) live in **local JSON locale files** consumed by a lightweight custom `useTranslation()` hook. No react-i18next dependency for now — migrate to it only if the translation surface grows significantly.

Update frequency: ~4 times/year. Sanity's free tier comfortably covers this at 1k+ visits/month.

---

## 1. Sanity CMS

### Setup
- One Sanity project, one dataset (`production`)
- Schema defined in a `sanity/` directory at the repo root (alongside `my-tanstack-app/`)
- Sanity Studio hosted at `sanity.io/manage` (Sanity-hosted studio, no self-hosting needed)
- Data fetched via Sanity's CDN using `@sanity/client` + TanStack Query

### Localization Approach
**Field-level localization** — each translatable field stores all three language values as an object:

```ts
// Sanity schema field type helper
{ en: string; pt: string; es: string }
```

This means a single document per entry (not one document per language), and all translations are visible side by side in the Studio. Simpler to manage for a solo content editor.

---

## 2. Sanity Schemas

### 2.1 Project

```ts
// sanity/schemas/project.ts
{
  name: 'project',
  fields: [
    { name: 'title',            type: 'localeString' },   // EN/PT/ES
    { name: 'slug',             type: 'slug', source: 'title.en' },
    { name: 'shortDescription', type: 'localeString' },   // EN/PT/ES, 1-2 lines
    { name: 'longDescription',  type: 'localeText' },     // EN/PT/ES, rich text
    { name: 'coverImage',       type: 'image' },
    { name: 'gallery',          type: 'array', of: [{ type: 'image' }] },
    { name: 'techStack',        type: 'array', of: [{ type: 'string' }] },
    { name: 'category',         type: 'string', options: { list: ['web','mobile','api','other'] } },
    { name: 'liveUrl',          type: 'url' },            // optional
    { name: 'githubUrl',        type: 'url' },            // optional
    { name: 'startDate',        type: 'date' },
    { name: 'endDate',          type: 'date' },           // null = ongoing
    { name: 'status',           type: 'string', options: { list: ['completed','in-progress','archived'] } },
    { name: 'featured',         type: 'boolean' },
  ]
}
```

### 2.2 Experience (Timeline)

```ts
// sanity/schemas/experience.ts
{
  name: 'experience',
  fields: [
    { name: 'company',     type: 'string' },              // not localized
    { name: 'companyUrl',  type: 'url' },                 // optional
    { name: 'companyLogo', type: 'image' },               // optional
    { name: 'role',        type: 'localeString' },        // EN/PT/ES
    { name: 'description', type: 'localeString' },        // EN/PT/ES, short paragraph
    { name: 'startDate',   type: 'date' },
    { name: 'endDate',     type: 'date' },                // null = "Present"
    { name: 'techStack',   type: 'array', of: [{ type: 'string' }] },
    {
      name: 'highlights',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'value', type: 'string' },              // e.g. "5", "200k"
          { name: 'label', type: 'localeString' },        // EN/PT/ES, e.g. "engineers led"
        ]
      }]
    },
  ]
}
```

### 2.3 Q&A

```ts
// sanity/schemas/qa.ts
{
  name: 'qa',
  fields: [
    { name: 'question', type: 'localeString' },  // EN/PT/ES
    { name: 'answer',   type: 'localeString' },  // EN/PT/ES, plain text
    { name: 'order',    type: 'number' },
  ]
}
```

### 2.4 Skills

```ts
// sanity/schemas/skills.ts
{
  name: 'skillCategory',
  fields: [
    { name: 'category', type: 'localeString' },  // EN/PT/ES
    {
      name: 'skills',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string' },       // not localized — tech names don't translate
          { name: 'icon', type: 'string' },       // optional lucide-react icon name
        ]
      }]
    },
    { name: 'order', type: 'number' },
  ]
}
```

### 2.5 Locale String Helper Type

A shared custom type used across all schemas for localized fields:

```ts
// sanity/schemas/locale/localeString.ts
{
  name: 'localeString',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English' },
    { name: 'pt', type: 'string', title: 'Portuguese' },
    { name: 'es', type: 'string', title: 'Spanish' },
  ]
}

// sanity/schemas/locale/localeText.ts — same but type: 'text' for long-form
```

---

## 3. Data Fetching

### Client Setup
```ts
// src/lib/sanity.ts
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,   // CDN for reads — fast, cached, free tier friendly
})
```

### Fetch Pattern
Data is fetched **server-side** in TanStack Start route loaders, so the browser receives pre-rendered HTML. TanStack Query is used for caching — no re-fetch on client navigation if data is still fresh.

```ts
// Example route loader
export const Route = createFileRoute('/')({
  loader: async () => ({
    experiences: await sanityClient.fetch(experiencesQuery),
    skills:      await sanityClient.fetch(skillsQuery),
    qa:          await sanityClient.fetch(qaQuery),
  }),
  component: HomePage,
})
```

GROQ queries live in `src/lib/queries/` — one file per content type.

### New Dependencies
```
@sanity/client
```

---

## 4. i18n — UI Strings

### Approach
Custom `useTranslation()` hook backed by JSON locale files. No external library.

### File Structure
```
src/
  i18n/
    locales/
      en.json
      pt.json
      es.json
    useTranslation.ts   — hook that reads current language from context
    LanguageContext.tsx  — React context storing current language + switcher
```

### Language Switching
A language toggle in the `Header` — three options (EN / PT / ES). Current language stored in React context, persisted to `localStorage` so the choice survives page reloads. Defaults to browser language on first visit (`navigator.language`), falling back to `en`.

### Hook Usage
```ts
const { t } = useTranslation()
// en.json: { "hero.cta.contact": "Get in touch" }
// pt.json: { "hero.cta.contact": "Entre em contato" }
// es.json: { "hero.cta.contact": "Contáctame" }

<button>{t('hero.cta.contact')}</button>
```

### Locale File Scope
UI strings only — button labels, section headings, navigation text, badge text, placeholder copy. Does NOT include project titles, descriptions, or any Sanity content (those come pre-localized from Sanity based on the active language).

### Migration Path
If the number of UI strings grows large or tooling (extraction, pluralization, interpolation) becomes necessary, migrate to `react-i18next`. The `useTranslation` hook interface stays the same — only the internals change, so component code requires no updates.

---

## 5. How Language Flows End-to-End

```
User picks language (Header toggle)
  → LanguageContext updates
    → useTranslation() returns strings from correct JSON file
    → Sanity content: components read active language from context
      and pick the matching field: entry.title[lang]
```

No re-fetch needed when switching language — Sanity data for all three languages is already in the loader response. The client just reads a different key.

---

## 6. Directory Structure

```
/
  sanity/                          — Sanity schema project
    schemas/
      project.ts
      experience.ts
      qa.ts
      skillCategory.ts
      locale/
        localeString.ts
        localeText.ts
    sanity.config.ts
  my-tanstack-app/
    src/
      lib/
        sanity.ts                  — Sanity client
        queries/
          experiences.ts
          projects.ts
          qa.ts
          skills.ts
      i18n/
        locales/
          en.json
          pt.json
          es.json
        useTranslation.ts
        LanguageContext.tsx
```

---

## 7. Open Items

- [ ] Create Sanity project at sanity.io and obtain `SANITY_PROJECT_ID`
- [ ] Add `SANITY_PROJECT_ID` to `.env.local`
- [ ] Decide on default language detection order (browser language → localStorage → fallback `en`)
- [ ] Populate initial content in Sanity Studio once schemas are deployed
- [ ] Architecture diagram content (Skills section) — blocked on project data being entered in Sanity
