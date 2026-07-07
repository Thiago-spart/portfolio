# Portfolio Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full portfolio home page (Hero → Timeline → Skills → Q&A → Contact) backed by Sanity CMS with PT/EN/ES i18n, including a 3D scroll-animated hero model via React Three Fiber.

**Architecture:** Sanity CMS stores all dynamic content (experiences, skills, Q&A) with field-level PT/EN/ES localization fetched in TanStack Start SSR route loaders. UI strings live in local JSON locale files consumed by a custom `useTranslation` hook. The hero uses React Three Fiber with a window-scroll-driven Y-axis rotation (sticky container approach — no drei ScrollControls, which is better suited for single-experience fullscreen apps than multi-section pages).

**Tech Stack:** TanStack Start (React 19 + Vite 8), React Three Fiber, @react-three/drei, Three.js, Sanity CMS v3, @sanity/client, Tailwind CSS v4, TypeScript 6, Vitest + @testing-library/react

## Global Constraints

- All working directory commands run from `my-tanstack-app/` unless otherwise noted
- Tailwind CSS v4 — no `tailwind.config.js`, utilities are defined inline or via `@theme` in `styles.css`
- No `react-i18next` — custom hook only; migrate if complexity demands it
- Three.js/R3F components cannot render in jsdom — unit tests check mounting and prop flow only; visual verification is required for 3D behaviour
- Sanity schemas live in `my-tanstack-app/sanity/schemas/`; client lives in `src/lib/sanity.ts`
- Language toggle persists to `localStorage` key `"lang"`, defaults to `navigator.language` slice (`"en"` | `"pt"` | `"es"`), falling back to `"en"`
- All "Get in touch" CTAs scroll to `#contact` anchor — no `/contact` route
- "See my work" links to `/projects` route (stub, not implemented in this plan)
- Hero scroll animation: hero wrapper is `250dvh` tall, inner layout is `sticky top-0 h-[100dvh]`; scroll progress is `clamp(0, -rect.top / (section.offsetHeight - window.innerHeight), 1)`
- Attribution for Living Things model: `3D model: "Living Things" by [author] — CC BY 4.0` (confirm author name from Sketchfab before Task 9)

---

## File Map

### Created
```
my-tanstack-app/
  sanity/
    schemas/
      locale/
        localeString.ts
        localeText.ts
      project.ts
      experience.ts
      qa.ts
      skillCategory.ts
    sanity.config.ts
    package.json
  src/
    types/
      sanity.ts
    lib/
      sanity.ts
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
      LanguageContext.tsx
      useTranslation.ts
    components/
      HeroSection.tsx
      HeroCanvas.tsx
      HeroModel.tsx
      TimelineEntry.tsx
      TimelineSection.tsx
      SkillCard.tsx
      SkillsSection.tsx
      ArchDiagram.tsx
      QASection.tsx
      ContactSection.tsx
    test/
      i18n.test.tsx
      TimelineEntry.test.tsx
      QASection.test.tsx
      ContactSection.test.tsx
      HeroSection.test.tsx
  vitest.setup.ts
  public/
    models/
      living-things.glb   ← manual download from Sketchfab
```

### Modified
```
my-tanstack-app/
  package.json            — add deps
  .env.local              — add SANITY_PROJECT_ID, VITE_SANITY_PROJECT_ID
  vite.config.ts          — add test config
  src/
    styles.css            — add Bebas Neue, design tokens, keyframes
    routes/__root.tsx     — wrap RootDocument body with LanguageProvider
    routes/index.tsx      — replace template with portfolio sections + loader
    components/Header.tsx — add language toggle
```

---

## Task 1: Install Dependencies + Vitest Setup

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `vitest.setup.ts`

**Interfaces:**
- Produces: working `pnpm test` command; Three.js canvas mock available in all tests

- [ ] **Step 1: Install runtime dependencies**

```bash
pnpm add @react-three/fiber @react-three/drei three @sanity/client
pnpm add -D @types/three sanity
```

- [ ] **Step 2: Add test config to vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})

export default config
```

- [ ] **Step 3: Create vitest.setup.ts with canvas + WebGL mock**

```ts
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Three.js requires a canvas with WebGL — mock it for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  useProgram: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getUniformLocation: vi.fn(),
  getAttribLocation: vi.fn(() => -1),
  uniform1i: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext
```

- [ ] **Step 4: Run tests to verify setup is working**

```bash
pnpm test
```

Expected: "No test files found" (passes with 0 tests — setup is valid)

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts vitest.setup.ts pnpm-lock.yaml
git commit -m "chore: install R3F, Sanity, Three.js deps; configure vitest with canvas mock"
```

---

## Task 2: Design Tokens + Bebas Neue Font

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: CSS variables `--electric-blue`, `--neon-purple`, `--near-black`, `--cyan-white`, `--muted-gray`; CSS classes `.hero-bg`, `.glitch-flicker`, `.glitch-rise`, `.cursor-blink`; Bebas Neue font available via `font-['Bebas_Neue']` Tailwind utility

- [ ] **Step 1: Add Bebas Neue to the Google Fonts import at the top of styles.css**

Replace the existing `@import url(...)` line:

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');
```

- [ ] **Step 2: Add design token CSS variables inside the existing `:root` block, after the last existing variable**

```css
/* Design reference: "A Light That Never Comes" */
--electric-blue: #00aaff;
--neon-purple: #7b2fff;
--near-black: #050508;
--dark-navy: #080d1a;
--cyan-white: #c8f0ff;
--muted-gray: #5a6a7a;
--electric-blue-glow: rgba(0, 170, 255, 0.35);
--purple-glow: rgba(123, 47, 255, 0.12);
```

- [ ] **Step 3: Add keyframes and utility classes after the existing `.rise-in` block**

```css
/* Hero background */
.hero-section-bg {
  background:
    radial-gradient(600px 600px at 75% 50%, rgba(0, 170, 255, 0.15), transparent 70%),
    radial-gradient(500px 400px at 20% 50%, rgba(123, 47, 255, 0.12), transparent 70%),
    #050508;
}

/* Primary button glitch on hover */
@keyframes glitch-flicker {
  0%, 100% { transform: translateX(0); clip-path: none; }
  20%       { transform: translateX(-2px); clip-path: inset(20% 0 60% 0); }
  40%       { transform: translateX(2px);  clip-path: inset(60% 0 20% 0); }
  60%       { transform: translateX(0);    clip-path: none; }
}

.glitch-flicker:hover {
  animation: glitch-flicker 120ms steps(1) 1;
}

/* Timeline entry entrance */
@keyframes glitch-rise {
  0%   { opacity: 0; transform: translateY(16px); }
  30%  { opacity: 0.6; transform: translateX(-3px) translateY(4px); }
  60%  { opacity: 0.9; transform: translateX(3px) translateY(0); }
  100% { opacity: 1;   transform: translateY(0); }
}

.glitch-rise {
  animation: glitch-rise 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* QA typing cursor */
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor-blink::after {
  content: '|';
  margin-left: 2px;
  animation: cursor-blink 600ms steps(1) infinite;
}

/* Available badge pulse dot */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

.pulse-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}
```

- [ ] **Step 4: Verify fonts load by running dev server and inspecting**

```bash
pnpm dev
```

Open browser → `http://localhost:3000` → check DevTools Network tab for `fonts.googleapis.com` request. No test needed (visual only).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css
git commit -m "style: add design tokens, Bebas Neue font, keyframes for hero/timeline/QA"
```

---

## Task 3: Sanity Project Setup + Schemas

**Files:**
- Create: `sanity/package.json`
- Create: `sanity/sanity.config.ts`
- Create: `sanity/schemas/locale/localeString.ts`
- Create: `sanity/schemas/locale/localeText.ts`
- Create: `sanity/schemas/experience.ts`
- Create: `sanity/schemas/qa.ts`
- Create: `sanity/schemas/skillCategory.ts`
- Create: `sanity/schemas/project.ts`
- Modify: `.env.local`

**Interfaces:**
- Produces: Sanity project with all schemas deployed; `VITE_SANITY_PROJECT_ID` env var available

**Prerequisites:** Create a free Sanity account at sanity.io and a new project ("Portfolio"). Copy the Project ID from the project dashboard.

- [ ] **Step 1: Create sanity directory and package.json**

```bash
mkdir -p sanity/schemas/locale
```

```json
// sanity/package.json
{
  "name": "portfolio-studio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev":    "sanity dev",
    "build":  "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "sanity": "^3.0.0",
    "react":  "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

- [ ] **Step 2: Create locale helper types**

```ts
// sanity/schemas/locale/localeString.ts
export const localeString = {
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    { name: 'en', title: 'English',    type: 'string' },
    { name: 'pt', title: 'Portuguese', type: 'string' },
    { name: 'es', title: 'Spanish',    type: 'string' },
  ],
}
```

```ts
// sanity/schemas/locale/localeText.ts
export const localeText = {
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    { name: 'en', title: 'English',    type: 'text' },
    { name: 'pt', title: 'Portuguese', type: 'text' },
    { name: 'es', title: 'Spanish',    type: 'text' },
  ],
}
```

- [ ] **Step 3: Create experience schema**

```ts
// sanity/schemas/experience.ts
export const experience = {
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    { name: 'company',     title: 'Company',      type: 'string' },
    { name: 'companyUrl',  title: 'Company URL',   type: 'url' },
    { name: 'companyLogo', title: 'Company Logo',  type: 'image' },
    { name: 'role',        title: 'Role',          type: 'localeString' },
    { name: 'description', title: 'Description',   type: 'localeString' },
    { name: 'startDate',   title: 'Start Date',    type: 'date' },
    { name: 'endDate',     title: 'End Date',      type: 'date' },
    {
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'value', title: 'Value', type: 'string' },
          { name: 'label', title: 'Label', type: 'localeString' },
        ],
      }],
    },
  ],
  orderings: [{ title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
}
```

- [ ] **Step 4: Create qa schema**

```ts
// sanity/schemas/qa.ts
export const qa = {
  name: 'qa',
  title: 'Q&A',
  type: 'document',
  fields: [
    { name: 'question', title: 'Question', type: 'localeString' },
    { name: 'answer',   title: 'Answer',   type: 'localeString' },
    { name: 'order',    title: 'Order',    type: 'number' },
  ],
}
```

- [ ] **Step 5: Create skillCategory schema**

```ts
// sanity/schemas/skillCategory.ts
export const skillCategory = {
  name: 'skillCategory',
  title: 'Skill Category',
  type: 'document',
  fields: [
    { name: 'category', title: 'Category', type: 'localeString' },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Name', type: 'string' },
          { name: 'icon', title: 'Icon (lucide name)', type: 'string' },
        ],
      }],
    },
    { name: 'order', title: 'Order', type: 'number' },
  ],
}
```

- [ ] **Step 6: Create project schema**

```ts
// sanity/schemas/project.ts
export const project = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    { name: 'title',            title: 'Title',             type: 'localeString' },
    { name: 'slug',             title: 'Slug',              type: 'slug', options: { source: 'title.en' } },
    { name: 'shortDescription', title: 'Short Description', type: 'localeString' },
    { name: 'longDescription',  title: 'Long Description',  type: 'localeText' },
    { name: 'coverImage',       title: 'Cover Image',       type: 'image' },
    { name: 'gallery',          title: 'Gallery',           type: 'array', of: [{ type: 'image' }] },
    { name: 'techStack',        title: 'Tech Stack',        type: 'array', of: [{ type: 'string' }] },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['web', 'mobile', 'api', 'other'] },
    },
    { name: 'liveUrl',   title: 'Live URL',    type: 'url' },
    { name: 'githubUrl', title: 'GitHub URL',  type: 'url' },
    { name: 'startDate', title: 'Start Date',  type: 'date' },
    { name: 'endDate',   title: 'End Date',    type: 'date' },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['completed', 'in-progress', 'archived'] },
    },
    { name: 'featured', title: 'Featured', type: 'boolean' },
  ],
}
```

- [ ] **Step 7: Create sanity.config.ts**

```ts
// sanity/sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { localeString } from './schemas/locale/localeString'
import { localeText }   from './schemas/locale/localeText'
import { experience }   from './schemas/experience'
import { qa }           from './schemas/qa'
import { skillCategory } from './schemas/skillCategory'
import { project }      from './schemas/project'

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio Studio',
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [localeString, localeText, experience, qa, skillCategory, project],
  },
})
```

- [ ] **Step 8: Add env vars to .env.local**

```bash
# .env.local — add these lines
SANITY_PROJECT_ID=your_project_id_here
VITE_SANITY_PROJECT_ID=your_project_id_here
```

- [ ] **Step 9: Install Sanity studio deps and deploy schemas**

```bash
cd sanity && npm install && npm run deploy
```

Follow CLI prompts to authenticate and confirm the studio URL. Expected output ends with `"Studio deployed to https://portfolio.sanity.studio"`.

- [ ] **Step 10: Commit**

```bash
git add sanity/ .env.local
git commit -m "feat: add Sanity schemas for experience, qa, skillCategory, project"
```

---

## Task 4: TypeScript Types for Sanity Content

**Files:**
- Create: `src/types/sanity.ts`

**Interfaces:**
- Produces: `LocaleString`, `SanityExperience`, `SanityQA`, `SanitySkillCategory`, `SanityProject` — used by all data-consuming components

- [ ] **Step 1: Create the types file**

```ts
// src/types/sanity.ts
export type Lang = 'en' | 'pt' | 'es'

export interface LocaleString {
  en: string
  pt: string
  es: string
}

export interface SanityHighlight {
  value: string
  label: LocaleString
}

export interface SanityExperience {
  _id: string
  company: string
  companyUrl?: string
  companyLogoUrl?: string
  role: LocaleString
  description: LocaleString
  startDate: string       // ISO date string "YYYY-MM-DD"
  endDate: string | null  // null = "Present"
  techStack: string[]
  highlights: SanityHighlight[]
}

export interface SanityQA {
  _id: string
  question: LocaleString
  answer: LocaleString
  order: number
}

export interface SanitySkill {
  name: string
  icon?: string
}

export interface SanitySkillCategory {
  _id: string
  category: LocaleString
  skills: SanitySkill[]
  order: number
}

export interface SanityProject {
  _id: string
  title: LocaleString
  slug: { current: string }
  shortDescription: LocaleString
  coverImageUrl?: string
  techStack: string[]
  category: 'web' | 'mobile' | 'api' | 'other'
  status: 'completed' | 'in-progress' | 'archived'
  featured: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/sanity.ts
git commit -m "feat: add TypeScript types for Sanity content models"
```

---

## Task 5: Sanity Client + GROQ Queries

**Files:**
- Create: `src/lib/sanity.ts`
- Create: `src/lib/queries/experiences.ts`
- Create: `src/lib/queries/qa.ts`
- Create: `src/lib/queries/skills.ts`
- Create: `src/lib/queries/projects.ts`

**Interfaces:**
- Consumes: `VITE_SANITY_PROJECT_ID` env var
- Produces: `sanityClient` singleton; `fetchExperiences()`, `fetchQA()`, `fetchSkills()`, `fetchProjects()` async functions returning typed arrays

- [ ] **Step 1: Create Sanity client**

```ts
// src/lib/sanity.ts
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

- [ ] **Step 2: Create experience query**

```ts
// src/lib/queries/experiences.ts
import { sanityClient } from '#/lib/sanity'
import type { SanityExperience } from '#/types/sanity'

const query = `*[_type == "experience"] | order(startDate desc) {
  _id,
  company,
  companyUrl,
  "companyLogoUrl": companyLogo.asset->url,
  role,
  description,
  startDate,
  endDate,
  techStack,
  highlights[] {
    value,
    label
  }
}`

export function fetchExperiences(): Promise<SanityExperience[]> {
  return sanityClient.fetch(query)
}
```

- [ ] **Step 3: Create Q&A query**

```ts
// src/lib/queries/qa.ts
import { sanityClient } from '#/lib/sanity'
import type { SanityQA } from '#/types/sanity'

const query = `*[_type == "qa"] | order(order asc) {
  _id,
  question,
  answer,
  order
}`

export function fetchQA(): Promise<SanityQA[]> {
  return sanityClient.fetch(query)
}
```

- [ ] **Step 4: Create skills query**

```ts
// src/lib/queries/skills.ts
import { sanityClient } from '#/lib/sanity'
import type { SanitySkillCategory } from '#/types/sanity'

const query = `*[_type == "skillCategory"] | order(order asc) {
  _id,
  category,
  skills[] { name, icon },
  order
}`

export function fetchSkills(): Promise<SanitySkillCategory[]> {
  return sanityClient.fetch(query)
}
```

- [ ] **Step 5: Create projects query**

```ts
// src/lib/queries/projects.ts
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
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sanity.ts src/lib/queries/
git commit -m "feat: add Sanity client and GROQ queries for all content types"
```

---

## Task 6: i18n Foundation

**Files:**
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/pt.json`
- Create: `src/i18n/locales/es.json`
- Create: `src/i18n/LanguageContext.tsx`
- Create: `src/i18n/useTranslation.ts`
- Create: `src/test/i18n.test.tsx`

**Interfaces:**
- Produces:
  - `LanguageProvider` React component — wraps the app
  - `useLanguage(): { lang: Lang; setLang: (l: Lang) => void }` hook
  - `useTranslation(): { t: (key: string) => string; lang: Lang }` hook

- [ ] **Step 1: Write the failing test**

```tsx
// src/test/i18n.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext'
import { useTranslation } from '../i18n/useTranslation'

function LangDisplay() {
  const { lang, setLang } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('pt')}>PT</button>
    </div>
  )
}

function TranslationDisplay() {
  const { t } = useTranslation()
  return <span data-testid="translation">{t('hero.cta.contact')}</span>
}

describe('i18n', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to "en"', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('switches language on setLang', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('PT'))
    expect(screen.getByTestId('lang').textContent).toBe('pt')
  })

  it('persists language to localStorage', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('PT'))
    expect(localStorage.getItem('lang')).toBe('pt')
  })

  it('returns correct string for active language', () => {
    render(<LanguageProvider><TranslationDisplay /></LanguageProvider>)
    expect(screen.getByTestId('translation').textContent).toBe('Get in touch')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/test/i18n.test.tsx
```

Expected: FAIL — `LanguageContext` not found

- [ ] **Step 3: Create locale JSON files**

```json
// src/i18n/locales/en.json
{
  "nav.home": "Home",
  "nav.projects": "Projects",
  "hero.badge": "Available for work",
  "hero.headline.line1": "Building things",
  "hero.headline.line2": "for the web",
  "hero.subtitle": "Full-stack developer passionate about building great digital experiences.",
  "hero.cta.contact": "Get in touch",
  "hero.cta.projects": "See my work",
  "timeline.title": "Experience",
  "timeline.present": "Present",
  "skills.title": "Skills",
  "qa.title": "Ask me anything",
  "contact.title": "Let's connect",
  "contact.subtitle": "Open to new projects, opportunities, and conversations.",
  "contact.linkedin": "LinkedIn",
  "contact.email": "Email"
}
```

```json
// src/i18n/locales/pt.json
{
  "nav.home": "Início",
  "nav.projects": "Projetos",
  "hero.badge": "Disponível para trabalho",
  "hero.headline.line1": "Construindo coisas",
  "hero.headline.line2": "para a web",
  "hero.subtitle": "Desenvolvedor full-stack apaixonado por criar ótimas experiências digitais.",
  "hero.cta.contact": "Entre em contato",
  "hero.cta.projects": "Ver meu trabalho",
  "timeline.title": "Experiência",
  "timeline.present": "Presente",
  "skills.title": "Habilidades",
  "qa.title": "Me pergunte algo",
  "contact.title": "Vamos nos conectar",
  "contact.subtitle": "Aberto a novos projetos, oportunidades e conversas.",
  "contact.linkedin": "LinkedIn",
  "contact.email": "E-mail"
}
```

```json
// src/i18n/locales/es.json
{
  "nav.home": "Inicio",
  "nav.projects": "Proyectos",
  "hero.badge": "Disponible para trabajo",
  "hero.headline.line1": "Construyendo cosas",
  "hero.headline.line2": "para la web",
  "hero.subtitle": "Desarrollador full-stack apasionado por crear grandes experiencias digitales.",
  "hero.cta.contact": "Contáctame",
  "hero.cta.projects": "Ver mi trabajo",
  "timeline.title": "Experiencia",
  "timeline.present": "Presente",
  "skills.title": "Habilidades",
  "qa.title": "Pregúntame algo",
  "contact.title": "Conectemos",
  "contact.subtitle": "Abierto a nuevos proyectos, oportunidades y conversaciones.",
  "contact.linkedin": "LinkedIn",
  "contact.email": "Correo"
}
```

- [ ] **Step 4: Create LanguageContext**

```tsx
// src/i18n/LanguageContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from '#/types/sanity'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

function detectLang(): Lang {
  const stored = localStorage.getItem('lang') as Lang | null
  if (stored === 'en' || stored === 'pt' || stored === 'es') return stored
  const browser = navigator.language.slice(0, 2)
  if (browser === 'pt') return 'pt'
  if (browser === 'es') return 'es'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  function setLang(l: Lang) {
    localStorage.setItem('lang', l)
    setLangState(l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
```

- [ ] **Step 5: Create useTranslation hook**

```ts
// src/i18n/useTranslation.ts
import { useLanguage } from './LanguageContext'
import en from './locales/en.json'
import pt from './locales/pt.json'
import es from './locales/es.json'

const locales = { en, pt, es } as const

export function useTranslation() {
  const { lang } = useLanguage()
  const strings = locales[lang]

  function t(key: keyof typeof en): string {
    return (strings as Record<string, string>)[key] ?? key
  }

  return { t, lang }
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
pnpm test src/test/i18n.test.tsx
```

Expected: 4 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/test/i18n.test.tsx
git commit -m "feat: add i18n foundation with LanguageContext and useTranslation hook"
```

---

## Task 7: Language Toggle in Header + LanguageProvider in Root

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: `LanguageProvider` from `#/i18n/LanguageContext`, `useLanguage` hook
- Produces: language toggle visible in header; all child components can call `useTranslation()`

- [ ] **Step 1: Wrap RootDocument body with LanguageProvider in __root.tsx**

Add the import at the top:
```ts
import { LanguageProvider } from '../i18n/LanguageContext'
```

Wrap the `<body>` children (wrap just before `<Header />` and close after `<Scripts />`):
```tsx
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
              StoreDevtools,
              TanStackQueryDevtools,
            ]}
          />
        </LanguageProvider>
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Add language toggle to Header.tsx**

Add imports:
```ts
import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../types/sanity'
```

Add the toggle component inside `Header`, in the right-side actions `div` before `<ThemeToggle />`:
```tsx
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
```

Add `<LangToggle />` before `<TanChatAIAssistant />` in the actions div.

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000` → confirm EN/PT/ES toggle is visible in the header and clicking switches the active highlight.

- [ ] **Step 4: Commit**

```bash
git add src/routes/__root.tsx src/components/Header.tsx
git commit -m "feat: add language toggle to header and LanguageProvider to root layout"
```

---

## Task 8: HeroSection — Left Column

**Files:**
- Create: `src/components/HeroSection.tsx`
- Create: `src/test/HeroSection.test.tsx`

**Interfaces:**
- Consumes: `useTranslation()`, `HeroCanvas` (imported but defined in Task 9 — use a placeholder `<div>` in tests)
- Produces: `<HeroSection />` — hero wrapper with badge, headline, subtitle, CTA buttons; passes `scrollProgress: number` prop to `HeroCanvas`

- [ ] **Step 1: Write failing test**

```tsx
// src/test/HeroSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import HeroSection from '../components/HeroSection'

vi.mock('../components/HeroCanvas', () => ({
  default: () => <div data-testid="hero-canvas" />,
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('HeroSection', () => {
  it('renders the available badge', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(screen.getByText('Available for work')).toBeInTheDocument()
  })

  it('renders CTA buttons with correct hrefs', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    const contactBtn = screen.getByRole('link', { name: /get in touch/i })
    expect(contactBtn).toHaveAttribute('href', '#contact')
    const projectsBtn = screen.getByRole('link', { name: /see my work/i })
    expect(projectsBtn).toHaveAttribute('href', '/projects')
  })

  it('renders HeroCanvas', () => {
    render(<HeroSection />, { wrapper: Wrapper })
    expect(screen.getByTestId('hero-canvas')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/test/HeroSection.test.tsx
```

Expected: FAIL — `HeroSection` not found

- [ ] **Step 3: Create HeroSection component**

```tsx
// src/components/HeroSection.tsx
import { useRef, useState, useEffect } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import HeroCanvas from './HeroCanvas'

export default function HeroSection() {
  const { t } = useTranslation()
  const wrapperRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={wrapperRef} style={{ height: '250dvh' }}>
      <div className="hero-section-bg sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[55fr_45fr] lg:px-12">
          {/* Left column */}
          <div className="flex flex-col justify-center gap-6">
            {/* Badge */}
            <div className="flex items-center gap-2 self-start rounded-full border border-[rgba(0,170,255,0.4)] bg-[rgba(5,5,8,0.8)] px-4 py-1.5">
              <span className="pulse-dot h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold tracking-widest text-[rgba(255,255,255,0.85)] uppercase">
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-['Bebas_Neue'] text-[clamp(3rem,7vw,6rem)] leading-none tracking-wider text-white">
              <span className="block">{t('hero.headline.line1')}</span>
              <span
                className="block"
                style={{ textShadow: '0 0 40px rgba(0,170,255,0.4)' }}
              >
                {t('hero.headline.line2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[480px] text-base text-[rgba(255,255,255,0.7)] sm:text-lg">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="glitch-flicker rounded-full border border-[#00aaff] bg-[rgba(5,5,8,0.9)] px-6 py-3 text-sm font-semibold text-[#c8f0ff] no-underline transition"
                style={{ boxShadow: '0 0 12px rgba(0,170,255,0.35)' }}
              >
                {t('hero.cta.contact')}
              </a>
              <a
                href="/projects"
                className="group flex items-center gap-2 text-sm font-semibold text-[rgba(255,255,255,0.6)] no-underline transition hover:text-white"
              >
                {t('hero.cta.projects')}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Right column — 3D canvas */}
          <div className="flex items-center justify-center lg:h-[100dvh]">
            <HeroCanvas scrollProgress={scrollProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm test src/test/HeroSection.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroSection.tsx src/test/HeroSection.test.tsx
git commit -m "feat: add HeroSection with badge, headline, CTA buttons, scroll tracker"
```

---

## Task 9: HeroModel + HeroCanvas (React Three Fiber)

**Prerequisites:** Place the downloaded `living-things.glb` file at `public/models/living-things.glb`. Confirm the author name from Sketchfab.

**Files:**
- Create: `src/components/HeroModel.tsx`
- Create: `src/components/HeroCanvas.tsx`

**Interfaces:**
- Consumes: `scrollProgress: number` prop (0–1 from HeroSection)
- Produces:
  - `HeroModel({ scrollProgress }: { scrollProgress: number })` — renders GLB, drives rotation
  - `HeroCanvas({ scrollProgress }: { scrollProgress: number })` — R3F Canvas with lights + Suspense

**Note:** R3F components cannot render in jsdom. Tests for these components verify mounting only. Visual behaviour must be verified manually in the browser.

- [ ] **Step 1: Create HeroModel**

```tsx
// src/components/HeroModel.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type * as THREE from 'three'

interface Props {
  scrollProgress: number
}

export default function HeroModel({ scrollProgress }: Props) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/living-things.glb')

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = scrollProgress * Math.PI * 2
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.05
  })

  return <primitive ref={ref} object={scene} scale={1.5} />
}

useGLTF.preload('/models/living-things.glb')
```

- [ ] **Step 2: Create HeroCanvas**

```tsx
// src/components/HeroCanvas.tsx
import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroModel from './HeroModel'

interface Props {
  scrollProgress: number
}

export default function HeroCanvas({ scrollProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative h-[50dvh] w-full lg:h-[70dvh]">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        camera={{ fov: 45, position: [0, 1, 5] }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <pointLight position={[-4, 4, 3]} color="#00aaff" intensity={2} />
        <pointLight position={[4, -2, -3]} color="#7b2fff" intensity={1.2} />

        <Suspense fallback={null}>
          <HeroModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>

      {/* Attribution */}
      <p className="absolute bottom-2 right-3 text-[10px] text-[#5a6a7a]">
        3D model: &quot;Living Things&quot; by [author] —{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          CC BY 4.0
        </a>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000`. Confirm:
1. 3D model renders in the right column
2. Scrolling down slowly rotates the model
3. Model has a floating idle bob animation
4. Blue rim light and purple fill light are visible
5. Attribution text appears below the canvas

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroModel.tsx src/components/HeroCanvas.tsx public/models/
git commit -m "feat: add React Three Fiber hero with GLB model, scroll rotation, and lighting"
```

---

## Task 10: Wire Hero into index.tsx + Route Loader

**Files:**
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: `HeroSection`, `fetchExperiences`, `fetchQA`, `fetchSkills`
- Produces: index route renders `HeroSection`; loader pre-fetches all home page data server-side

- [ ] **Step 1: Replace index.tsx with hero + loader**

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import HeroSection          from '#/components/HeroSection'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [experiences, qa, skills] = await Promise.all([
      fetchExperiences(),
      fetchQA(),
      fetchSkills(),
    ])
    return { experiences, qa, skills }
  },
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <HeroSection />
      {/* Remaining sections added in Task 16 */}
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000`. Confirm the full hero renders. Open DevTools Network → check no Sanity fetch happens in the browser (it should have been done server-side in the loader).

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: wire HeroSection into index route with SSR data loader"
```

---

## Task 11: TimelineEntry Component

**Files:**
- Create: `src/components/TimelineEntry.tsx`
- Create: `src/test/TimelineEntry.test.tsx`

**Interfaces:**
- Consumes: `SanityExperience`, `lang: Lang`, `useTranslation()`
- Produces: `<TimelineEntry entry={SanityExperience} lang={Lang} />` — collapsed/expanded toggle on click

- [ ] **Step 1: Write failing test**

```tsx
// src/test/TimelineEntry.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import TimelineEntry from '../components/TimelineEntry'
import type { SanityExperience } from '../types/sanity'

const mockEntry: SanityExperience = {
  _id: '1',
  company: 'Acme Corp',
  role: { en: 'Senior Developer', pt: 'Desenvolvedor Sênior', es: 'Desarrollador Senior' },
  description: { en: 'Built great things.', pt: 'Construí coisas ótimas.', es: 'Construí cosas geniales.' },
  startDate: '2022-01-01',
  endDate: null,
  techStack: ['React', 'Node.js'],
  highlights: [{ value: '5', label: { en: 'engineers led', pt: 'engenheiros liderados', es: 'ingenieros liderados' } }],
}

describe('TimelineEntry', () => {
  it('shows company and role', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('shows tech stack tags', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('does not show highlights by default', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('shows highlights after click', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('engineers led')).toBeInTheDocument()
  })

  it('collapses highlights on second click', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('shows "Present" when endDate is null', () => {
    render(<LanguageProvider><TimelineEntry entry={mockEntry} lang="en" /></LanguageProvider>)
    expect(screen.getByText(/present/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/test/TimelineEntry.test.tsx
```

Expected: FAIL — `TimelineEntry` not found

- [ ] **Step 3: Create TimelineEntry component**

```tsx
// src/components/TimelineEntry.tsx
import { useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import type { SanityExperience, Lang } from '#/types/sanity'

interface Props {
  entry: SanityExperience
  lang: Lang
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

export default function TimelineEntry({ entry, lang }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const endLabel = entry.endDate ? formatDate(entry.endDate) : t('timeline.present')

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full rounded-2xl border border-[rgba(0,170,255,0.2)] bg-[rgba(8,13,26,0.85)] p-5 text-left transition hover:border-[rgba(0,170,255,0.5)]"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00aaff]">
            {formatDate(entry.startDate)} — {endLabel}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-white">{entry.company}</h3>
          <p className="text-sm text-[#00aaff]">{entry.role[lang]}</p>
        </div>
        <span className="mt-1 text-[#5a6a7a] transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-[rgba(255,255,255,0.7)]">{entry.description[lang]}</p>

      {/* Tech stack */}
      <div className="mt-3 flex flex-wrap gap-2">
        {entry.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[rgba(0,170,255,0.3)] bg-[rgba(0,170,255,0.06)] px-2.5 py-0.5 text-[11px] text-[rgba(255,255,255,0.7)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Highlights — expanded */}
      {open && entry.highlights.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(0,170,255,0.15)] pt-4 sm:grid-cols-3">
          {entry.highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-xl border border-[rgba(0,170,255,0.3)] bg-[rgba(0,170,255,0.06)] p-3 text-center"
              style={{ boxShadow: '0 0 12px rgba(0,170,255,0.1) inset' }}
            >
              <p className="text-xl font-bold text-white">{h.value}</p>
              <p className="mt-0.5 text-[11px] text-[#5a6a7a]">{h.label[lang]}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm test src/test/TimelineEntry.test.tsx
```

Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/TimelineEntry.tsx src/test/TimelineEntry.test.tsx
git commit -m "feat: add TimelineEntry with click-to-toggle highlights"
```

---

## Task 12: TimelineSection Component

**Files:**
- Create: `src/components/TimelineSection.tsx`

**Interfaces:**
- Consumes: `SanityExperience[]` array, `lang: Lang`, `useTranslation()`; renders `TimelineEntry` per item
- Produces: `<TimelineSection experiences={SanityExperience[]} lang={Lang} />`

- [ ] **Step 1: Create TimelineSection**

```tsx
// src/components/TimelineSection.tsx
import { useEffect, useRef } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import TimelineEntry from './TimelineEntry'
import type { SanityExperience, Lang } from '#/types/sanity'

interface Props {
  experiences: SanityExperience[]
  lang: Lang
}

function useGlitchRise(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = Array.from(el.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = children.indexOf(entry.target as HTMLElement)
            const target = entry.target as HTMLElement
            target.style.animationDelay = `${index * 80}ms`
            target.classList.remove('opacity-0')   // remove before adding animation to avoid fill-mode conflict
            target.classList.add('glitch-rise')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    children.forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [ref])
}

export default function TimelineSection({ experiences, lang }: Props) {
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)
  useGlitchRise(listRef as React.RefObject<HTMLElement>)

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Section heading */}
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('timeline.title')}
        </p>

        {/* Desktop: center spine + alternating; Mobile: left spine */}
        <div className="relative">
          {/* Spine */}
          <div
            className="absolute left-4 top-0 h-full w-px lg:left-1/2"
            style={{ background: '#00aaff', boxShadow: '0 0 8px rgba(0,170,255,0.5)' }}
          />

          <div ref={listRef} className="flex flex-col gap-8 pl-10 lg:pl-0">
            {experiences.map((entry, i) => (
              <div
                key={entry._id}
                className={`relative opacity-0 lg:w-[calc(50%-2rem)] ${
                  i % 2 === 0 ? 'lg:ml-auto lg:pl-8' : 'lg:mr-auto lg:pr-8'
                }`}
              >
                {/* Mobile: dot always on left */}
                <span
                  className="absolute -left-10 top-5 h-3 w-3 rounded-full bg-[#00aaff] lg:hidden"
                  style={{ boxShadow: '0 0 8px rgba(0,170,255,0.8)' }}
                />
                {/* Desktop: dot on the spine side of this entry */}
                <span
                  className={`absolute top-5 hidden h-3 w-3 rounded-full bg-[#00aaff] lg:block ${
                    i % 2 === 0 ? 'left-[-1.625rem]' : 'right-[-1.625rem]'
                  }`}
                  style={{ boxShadow: '0 0 8px rgba(0,170,255,0.8)' }}
                />
                <TimelineEntry entry={entry} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify in browser (requires at least one Sanity experience entry)**

Add a test entry in Sanity Studio, then:
```bash
pnpm dev
```

Open `http://localhost:3000`. Scroll to the timeline. Confirm:
1. Entries animate in with glitch-rise on scroll
2. Click toggles highlights open/closed
3. On desktop: alternating left/right layout with center spine
4. On mobile: all entries right of left-edge spine

- [ ] **Step 3: Commit**

```bash
git add src/components/TimelineSection.tsx
git commit -m "feat: add TimelineSection with alternating desktop layout and IntersectionObserver entrance"
```

---

## Task 13: SkillCard + SkillsSection + ArchDiagram Placeholder

**Files:**
- Create: `src/components/SkillCard.tsx`
- Create: `src/components/ArchDiagram.tsx`
- Create: `src/components/SkillsSection.tsx`

**Interfaces:**
- Consumes: `SanitySkillCategory[]`, `lang: Lang`, `useTranslation()`
- Produces: `<SkillsSection categories={SanitySkillCategory[]} lang={Lang} />`

- [ ] **Step 1: Create SkillCard**

```tsx
// src/components/SkillCard.tsx
import type { SanitySkillCategory, Lang } from '#/types/sanity'

interface Props {
  category: SanitySkillCategory
  lang: Lang
}

export default function SkillCard({ category, lang }: Props) {
  return (
    <div
      className="rounded-2xl border-l-2 bg-[rgba(8,13,26,0.85)] p-5"
      style={{
        borderColor: '#00aaff',
        boxShadow: '0 0 20px rgba(0,170,255,0.06) inset',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
        {category.category[lang]}
      </p>
      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill) => (
          <span
            key={skill.name}
            className="rounded-full border border-[rgba(0,170,255,0.2)] bg-[rgba(0,170,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ArchDiagram placeholder**

```tsx
// src/components/ArchDiagram.tsx
export default function ArchDiagram() {
  return (
    <div
      className="flex min-h-48 items-center justify-center rounded-2xl border border-[rgba(0,170,255,0.2)] bg-[rgba(8,13,26,0.85)]"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <p className="text-sm text-[#5a6a7a]">
        Architecture diagram — coming after project data strategy
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create SkillsSection**

```tsx
// src/components/SkillsSection.tsx
import { useRef } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import SkillCard from './SkillCard'
import ArchDiagram from './ArchDiagram'
import type { SanitySkillCategory, Lang } from '#/types/sanity'

interface Props {
  categories: SanitySkillCategory[]
  lang: Lang
}

export default function SkillsSection({ categories, lang }: Props) {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('skills.title')}
        </p>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <div
              key={cat._id}
              className="rise-in opacity-0"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <SkillCard category={cat} lang={lang} />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="my-12 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #00aaff, transparent)' }}
        />

        {/* Architecture diagram */}
        <ArchDiagram />
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify in browser (requires at least one Sanity skill category)**

```bash
pnpm dev
```

Confirm category cards render in a 2-col mobile / 4-col desktop grid with left blue border. Arch diagram placeholder is visible below the divider.

- [ ] **Step 5: Commit**

```bash
git add src/components/SkillCard.tsx src/components/ArchDiagram.tsx src/components/SkillsSection.tsx
git commit -m "feat: add SkillsSection with category grid and ArchDiagram placeholder"
```

---

## Task 14: QASection Component

**Files:**
- Create: `src/components/QASection.tsx`
- Create: `src/test/QASection.test.tsx`

**Interfaces:**
- Consumes: `SanityQA[]`, `lang: Lang`
- Produces: `<QASection items={SanityQA[]} lang={Lang} />`

- [ ] **Step 1: Write failing test**

```tsx
// src/test/QASection.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import QASection from '../components/QASection'
import type { SanityQA } from '../types/sanity'

const mockItems: SanityQA[] = [
  {
    _id: '1',
    order: 1,
    question: { en: 'Are you available?', pt: 'Está disponível?', es: '¿Estás disponible?' },
    answer:   { en: 'Yes, I am.',         pt: 'Sim, estou.',       es: 'Sí, lo estoy.' },
  },
]

describe('QASection', () => {
  it('renders question bubbles', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.getByText('Are you available?')).toBeInTheDocument()
  })

  it('does not show answer by default', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    expect(screen.queryByText('Yes, I am.')).not.toBeInTheDocument()
  })

  it('shows answer after clicking question', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Are you available?'))
    expect(screen.getByText('Yes, I am.')).toBeInTheDocument()
  })

  it('hides answer after second click', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="en" /></LanguageProvider>)
    fireEvent.click(screen.getByText('Are you available?'))
    fireEvent.click(screen.getByText('Are you available?'))
    expect(screen.queryByText('Yes, I am.')).not.toBeInTheDocument()
  })

  it('renders question in correct language', () => {
    render(<LanguageProvider><QASection items={mockItems} lang="pt" /></LanguageProvider>)
    expect(screen.getByText('Está disponível?')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/test/QASection.test.tsx
```

Expected: FAIL — `QASection` not found

- [ ] **Step 3: Create QASection component**

```tsx
// src/components/QASection.tsx
import { useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import type { SanityQA, Lang } from '#/types/sanity'

interface Props {
  items: SanityQA[]
  lang: Lang
}

export default function QASection({ items, lang }: Props) {
  const { t } = useTranslation()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('qa.title')}
        </p>

        {/* Chat window */}
        <div
          className="overflow-hidden rounded-2xl border border-[rgba(0,170,255,0.3)] bg-[rgba(8,13,26,0.9)]"
          style={{ boxShadow: '0 0 0 1px rgba(0,170,255,0.1), 0 24px 48px rgba(0,0,0,0.4)' }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-[rgba(0,170,255,0.15)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-[#5a6a7a]">ask_thiago.sh</span>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 p-4">
            {items.map((item) => {
              const isOpen = openIds.has(item._id)
              return (
                <div key={item._id} className="flex flex-col gap-2">
                  {/* Question bubble — left */}
                  <button
                    onClick={() => toggle(item._id)}
                    className="self-start rounded-2xl rounded-tl-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-left text-sm text-[rgba(255,255,255,0.85)] transition hover:border-[rgba(255,255,255,0.2)]"
                  >
                    {item.question[lang]}
                  </button>

                  {/* Answer bubble — right */}
                  {isOpen && (
                    <div
                      className="cursor-blink self-end rounded-2xl rounded-tr-sm border border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] px-4 py-2.5 text-sm text-[rgba(255,255,255,0.8)]"
                      style={{ maxWidth: '85%' }}
                    >
                      {item.answer[lang]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm test src/test/QASection.test.tsx
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/QASection.tsx src/test/QASection.test.tsx
git commit -m "feat: add QASection with chat window UI and typing-cursor answer reveal"
```

---

## Task 15: ContactSection Component

**Files:**
- Create: `src/components/ContactSection.tsx`
- Create: `src/test/ContactSection.test.tsx`

**Interfaces:**
- Consumes: `useTranslation()`
- Produces: `<ContactSection />` with `id="contact"` anchor, LinkedIn + email cards

- [ ] **Step 1: Write failing test**

```tsx
// src/test/ContactSection.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import ContactSection from '../components/ContactSection'

describe('ContactSection', () => {
  it('has the #contact anchor', () => {
    const { container } = render(<LanguageProvider><ContactSection /></LanguageProvider>)
    expect(container.querySelector('#contact')).toBeInTheDocument()
  })

  it('renders LinkedIn link with correct href', () => {
    render(<LanguageProvider><ContactSection /></LanguageProvider>)
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/thiago-moraes-souza/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders email link with mailto', () => {
    render(<LanguageProvider><ContactSection /></LanguageProvider>)
    const link = screen.getByRole('link', { name: /email/i })
    expect(link).toHaveAttribute('href', 'mailto:thiagomoraes.contact@gmail.com')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/test/ContactSection.test.tsx
```

Expected: FAIL — `ContactSection` not found

- [ ] **Step 3: Create ContactSection component**

```tsx
// src/components/ContactSection.tsx
import { useTranslation } from '#/i18n/useTranslation'

export default function ContactSection() {
  const { t } = useTranslation()

  const cards = [
    {
      label: t('contact.linkedin'),
      address: 'thiago-moraes-souza',
      href: 'https://www.linkedin.com/in/thiago-moraes-souza/',
      target: '_blank' as const,
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
      target: '_self' as const,
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-[#00aaff] fill-none" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ]

  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-['Bebas_Neue'] text-[clamp(2rem,5vw,4rem)] tracking-wider text-white">
          {t('contact.title')}
        </h2>
        <p className="mt-3 text-sm text-[rgba(255,255,255,0.55)]">
          {t('contact.subtitle')}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target={card.target}
              rel={card.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-[rgba(0,170,255,0.3)] bg-[rgba(8,13,26,0.85)] p-6 no-underline transition hover:border-[rgba(0,170,255,0.7)]"
              style={{
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 0 0 rgba(0,170,255,0)',
                transition: 'border-color 200ms, box-shadow 200ms',
              }}
            >
              {card.icon}
              <p className="text-sm font-bold text-white">{card.label}</p>
              <p className="text-xs text-[#5a6a7a]">{card.address}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm test src/test/ContactSection.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactSection.tsx src/test/ContactSection.test.tsx
git commit -m "feat: add ContactSection with LinkedIn and email cards"
```

---

## Task 16: Wire All Sections into index.tsx

**Files:**
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes: all section components; `experiences`, `qa`, `skills` from route loader; `lang` from `useLanguage()`
- Produces: complete home page

- [ ] **Step 1: Update index.tsx with all sections**

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import { useLanguage }      from '#/i18n/LanguageContext'
import HeroSection          from '#/components/HeroSection'
import TimelineSection      from '#/components/TimelineSection'
import SkillsSection        from '#/components/SkillsSection'
import QASection            from '#/components/QASection'
import ContactSection       from '#/components/ContactSection'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [experiences, qa, skills] = await Promise.all([
      fetchExperiences(),
      fetchQA(),
      fetchSkills(),
    ])
    return { experiences, qa, skills }
  },
  component: HomePage,
})

function HomePage() {
  const { experiences, qa, skills } = Route.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <HeroSection />
      <TimelineSection experiences={experiences} lang={lang} />
      <SkillsSection categories={skills} lang={lang} />
      <QASection items={qa} lang={lang} />
      <ContactSection />
    </main>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm test
```

Expected: All tests PASS

- [ ] **Step 3: Verify full page in browser**

```bash
pnpm dev
```

Verify in order:
1. Hero renders with 3D model and scroll rotation
2. Language toggle switches all text (hero, timeline labels, Q&A, contact)
3. Timeline entries animate in on scroll; click expands highlights
4. Skills grid renders in 2/4 columns; arch diagram placeholder visible
5. Q&A chat window: click question → answer appears with cursor animation
6. "Get in touch" buttons (hero + any other) scroll smoothly to `#contact`
7. Contact cards: LinkedIn opens new tab; email opens mail client

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: wire all home sections into index route — hero, timeline, skills, Q&A, contact"
```

---

## Summary

| Task | Deliverable |
|------|-------------|
| 1 | Dependencies installed, Vitest canvas mock |
| 2 | Design tokens, Bebas Neue, keyframes |
| 3 | Sanity schemas deployed |
| 4 | TypeScript content types |
| 5 | Sanity client + GROQ queries |
| 6 | i18n context + hook + 3 locale files |
| 7 | Language toggle in header |
| 8 | HeroSection left column |
| 9 | HeroCanvas + HeroModel (R3F) |
| 10 | Hero wired into index + loader |
| 11 | TimelineEntry component |
| 12 | TimelineSection with spine |
| 13 | SkillCard + SkillsSection + ArchDiagram stub |
| 14 | QASection chat window |
| 15 | ContactSection |
| 16 | All sections wired into index |
