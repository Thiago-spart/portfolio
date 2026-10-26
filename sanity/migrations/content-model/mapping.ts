// Pure helpers for the content-model migration (#46). No I/O here: build.ts
// reads the snapshot and writes files, validate.ts checks the output.
import { createHash } from 'node:crypto'

export type Locale = 'en' | 'pt' | 'es'
export const LOCALES: readonly Locale[] = ['en', 'pt', 'es']
export type L10n = Record<Locale, string>

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type ParsedMetric = {
  before?: number
  after: number
  unit?: string
  // The source said "N+" (at least N). The schema has no field for that, so
  // the value is kept as N and the loss is reported in REVIEW.md.
  atLeast?: boolean
  // The source had an explicit sign ("+40%", "−96%").
  signed?: boolean
}

const NUMBER = String.raw`[+\-−]?\d+(?:[.,]\d+)?`
const UNIT = String.raw`\s*(%|ms|s|x|k|wk|mo|d)?`
const SINGLE = new RegExp(String.raw`^(${NUMBER})${UNIT}(\+)?$`)
const RANGE = new RegExp(String.raw`^(${NUMBER})${UNIT}\s*(?:→|->|to)\s*(${NUMBER})${UNIT}$`)

function toNumber(raw: string) {
  return Number(raw.replace('−', '-').replace(',', '.'))
}

/**
 * Turns a highlight value into numbers. Returns null when the value is not a
 * single measurement ("Next.js SSG + BFF", "95+/98+", "PWA"): those are
 * reported, never dropped silently.
 *
 *   "40 → 95"   → { before: 40, after: 95 }
 *   "23% → 9%"  → { before: 23, after: 9, unit: "%" }
 *   "+40%"      → { after: 40, unit: "%", signed: true }
 *   "−96%"      → { after: -96, unit: "%", signed: true }
 *   "90+"       → { after: 90, atLeast: true }
 */
export function parseMetricValue(value: string): ParsedMetric | null {
  const text = value.trim()
  const range = RANGE.exec(text)
  if (range) {
    const [, before, unitBefore, after, unitAfter] = range
    if (unitBefore && unitAfter && unitBefore !== unitAfter) return null
    const unit = unitAfter ?? unitBefore
    return { before: toNumber(before), after: toNumber(after), ...(unit ? { unit } : {}) }
  }
  const single = SINGLE.exec(text)
  if (single) {
    const [, number, unit, plus] = single
    if (unit === 'k') return null // "70k+": the schema would show 70000; see REVIEW.md
    return {
      after: toNumber(number),
      ...(unit ? { unit } : {}),
      ...(plus ? { atLeast: true } : {}),
      ...(/^[+\-−]/.test(number) ? { signed: true } : {}),
    }
  }
  return null
}

export type Direction = 'up' | 'down'

/**
 * Applies the one convention for single-value changes: a reduction with no
 * "before" is stored as a negative `after` with direction "down", so "96%
 * fewer production bugs" becomes after −96, unit %, rendered "−96%". Levels
 * ("80% coverage") and before → after pairs keep their numbers as-is.
 */
export function toMetricNumbers(parsed: ParsedMetric, direction: Direction, isChange: boolean) {
  const { before, unit } = parsed
  let after = parsed.after
  if (before == null && isChange && direction === 'down' && after > 0) after = -after
  return { ...(before != null ? { before } : {}), after, ...(unit ? { unit } : {}) }
}

// ---------------------------------------------------------------------------
// Tech names
// ---------------------------------------------------------------------------

export const TECH_CATEGORIES = ['frontend', 'mobile', 'backend', 'data', 'testing', 'tooling', 'ai', 'practice'] as const
export type TechCategory = (typeof TECH_CATEGORIES)[number]

/**
 * Spelling-insensitive key: case, spaces, dots, hyphens and a trailing "js"
 * don't matter, so "Next.js", "NextJS" and "nextjs" collide, and so do
 * "React.js" and "React".
 */
export function techKey(name: string) {
  const k = name.toLowerCase().replace(/[^a-z0-9+#]/g, '')
  return k.length > 4 && k.endsWith('js') ? k.slice(0, -2) : k
}

type Canonical = { category: TechCategory; aliases?: string[] }

// Canonical name → category and the other spellings found in the data.
// Every skill and every techStack string in the snapshot must resolve here
// (or be split by SPLITS, or be dropped by DROP); build.ts throws otherwise.
export const CANONICAL: Record<string, Canonical> = {
  // frontend
  'React':                   { category: 'frontend' },
  'Next.js':                 { category: 'frontend' },
  'Vue':                     { category: 'frontend', aliases: ['Vue.js'] },
  'Preact':                  { category: 'frontend' },
  'TypeScript':              { category: 'frontend' },
  'JavaScript':              { category: 'frontend' },
  'HTML':                    { category: 'frontend' },
  'CSS':                     { category: 'frontend' },
  'Sass':                    { category: 'frontend', aliases: ['SASS'] },
  'BEM':                     { category: 'frontend' },
  'Tailwind CSS':            { category: 'frontend' },
  'daisyUI':                 { category: 'frontend' },
  'MUI':                     { category: 'frontend' },
  'Ant Design':              { category: 'frontend' },
  'shadcn/ui':               { category: 'frontend', aliases: ['Shadcn UI'] },
  'Radix UI':                { category: 'frontend' },
  'styled-components':       { category: 'frontend', aliases: ['Styled Components'] },
  'Redux':                   { category: 'frontend' },
  'Zustand':                 { category: 'frontend' },
  'Jotai':                   { category: 'frontend' },
  'Recoil':                  { category: 'frontend' },
  'TanStack Query':          { category: 'frontend', aliases: ['React Query'] },
  'TanStack Router':         { category: 'frontend' },
  'TanStack Start':          { category: 'frontend' },
  'React Hook Form':         { category: 'frontend' },
  'Zod':                     { category: 'frontend' },
  'Axios':                   { category: 'frontend' },
  'Three.js':                { category: 'frontend' },
  'React Three Fiber':       { category: 'frontend', aliases: ['React Three Fiber (R3F)'] },
  'Drei':                    { category: 'frontend' },
  'WebGL':                   { category: 'frontend' },
  'Draco':                   { category: 'frontend', aliases: ['Draco Compression'] },
  'GSAP':                    { category: 'frontend', aliases: ['GSAP & ScrollTrigger', 'ScrollTrigger'] },
  'Framer Motion':           { category: 'frontend', aliases: ['Motion (Framer Motion)'] },
  'Chart.js':                { category: 'frontend' },
  'PDF.js':                  { category: 'frontend' },
  'Vite':                    { category: 'frontend' },
  'SSR':                     { category: 'frontend' },
  'SSG':                     { category: 'frontend' },
  'ISR':                     { category: 'frontend', aliases: ['ISG'] },
  'React Server Components': { category: 'frontend', aliases: ['Server Components'] },
  'PWA':                     { category: 'frontend' },
  'List virtualization':     { category: 'frontend', aliases: ['React Virtualization'] },
  // mobile
  'React Native':            { category: 'mobile' },
  'Expo':                    { category: 'mobile' },
  'React Navigation':        { category: 'mobile' },
  'Reanimated':              { category: 'mobile' },
  'NativeWind':              { category: 'mobile' },
  'Tamagui':                 { category: 'mobile' },
  'React Native Reusables':  { category: 'mobile' },
  'UI Kitten':               { category: 'mobile' },
  'WatermelonDB':            { category: 'mobile' },
  'React Native Keychain':   { category: 'mobile' },
  'React Native Vision Camera': { category: 'mobile' },
  'React Native Maps':       { category: 'mobile' },
  'Expo Local Authentication': { category: 'mobile' },
  'Notifee':                 { category: 'mobile' },
  'AsyncStorage':            { category: 'mobile' },
  'Google Maps API':         { category: 'mobile' },
  'Geolocation':             { category: 'mobile', aliases: ['Maps & Geolocation'] },
  // backend
  'Node.js':                 { category: 'backend' },
  'NestJS':                  { category: 'backend' },
  'Express':                 { category: 'backend' },
  'Bun':                     { category: 'backend' },
  'Supabase Edge Functions': { category: 'backend', aliases: ['Supabase Edge Functions (Deno)'] },
  'PHP':                     { category: 'backend' },
  'WordPress':               { category: 'backend', aliases: ['WordPress REST API'] },
  'GraphQL':                 { category: 'backend' },
  'WebSockets':              { category: 'backend' },
  // data
  'PostgreSQL':              { category: 'data' },
  'MongoDB':                 { category: 'data' },
  'Redis':                   { category: 'data' },
  'Prisma':                  { category: 'data' },
  'Drizzle ORM':             { category: 'data' },
  'Firebase':                { category: 'data' },
  'Supabase':                { category: 'data', aliases: ['Supabase Auth & Storage'] },
  'SQL':                     { category: 'data' },
  'SQL migrations':          { category: 'data', aliases: ['SQL Migrations'] },
  'Row-Level Security (RLS)': { category: 'data' },
  // testing
  'Jest':                    { category: 'testing' },
  'Vitest':                  { category: 'testing' },
  'Vitest Browser Mode':     { category: 'testing' },
  'Cypress':                 { category: 'testing' },
  'Playwright':              { category: 'testing' },
  'Maestro':                 { category: 'testing' },
  'React Testing Library':   { category: 'testing', aliases: ['React Testing Library (RTL)', 'RTL'] },
  'React Native Testing Library': { category: 'testing', aliases: ['React Native Testing Library (RNTL)', 'RNTL'] },
  'Storybook':               { category: 'testing' },
  'MSW':                     { category: 'testing', aliases: ['MSW (Mock Service Worker)'] },
  'E2E testing':             { category: 'testing', aliases: ['E2E Testing'] },
  'Database integration tests': { category: 'testing', aliases: ['Database Integration Tests (RLS)'] },
  // tooling
  'Git':                     { category: 'tooling' },
  'GitHub':                  { category: 'tooling' },
  'GitHub Actions':          { category: 'tooling' },
  'Bitbucket':               { category: 'tooling' },
  'CI/CD':                   { category: 'tooling' },
  'Docker':                  { category: 'tooling' },
  'Docker Compose':          { category: 'tooling' },
  'AWS':                     { category: 'tooling' },
  'Google Cloud':            { category: 'tooling', aliases: ['GCP (Google Cloud Platform)'] },
  'Vercel':                  { category: 'tooling' },
  'Cloudflare':              { category: 'tooling', aliases: ['Cloudflare (Workers & Wrangler)', 'Cloudflare CDN'] },
  'Fly.io':                  { category: 'tooling' },
  'Supabase CLI':            { category: 'tooling' },
  'Sentry':                  { category: 'tooling' },
  'Postman':                 { category: 'tooling' },
  'Figma':                   { category: 'tooling' },
  'Lighthouse':              { category: 'tooling' },
  'Python':                  { category: 'tooling' },
  'Bash':                    { category: 'tooling' },
  // ai
  'Claude':                  { category: 'ai' },
  'Claude Code':             { category: 'ai' },
  'Cursor':                  { category: 'ai' },
  'Antigravity':             { category: 'ai', aliases: ['Antigravity (agy)'] },
  'GitHub Copilot':          { category: 'ai' },
  'Gemini':                  { category: 'ai' },
  'ChatGPT':                 { category: 'ai' },
  'OpenAI GPT':              { category: 'ai' },
  'v0':                      { category: 'ai' },
  'Windsurf':                { category: 'ai' },
  'Lovable':                 { category: 'ai' },
  'MCP':                     { category: 'ai', aliases: ['MCP (Model Context Protocol)', 'MCP Servers'] },
  'AI agents':               { category: 'ai', aliases: ['AI Agents', 'Agentic Development & AI Pair Programming', 'AI Workflow Automation'] },
  // practice
  'Micro-frontends':         { category: 'practice', aliases: ['Micro-Frontends', 'Micro-Frontend Architecture'] },
  'BFF (Backend for Frontend)': { category: 'practice', aliases: ['BFF', 'Backend-For-Frontend (BFF)'] },
  'Headless CMS':            { category: 'practice', aliases: ['Headless CMS Architecture'] },
  'Real-time / event-driven architecture': { category: 'practice', aliases: ['Real-time / Event-driven Architecture'] },
  'Offline-first':           { category: 'practice', aliases: ['Offline-First', 'Offline-first Architecture'] },
  'Local-first':             { category: 'practice', aliases: ['Local-First'] },
  'Contract-first APIs':     { category: 'practice', aliases: ['API / Contract-first Development'] },
  'Clean Architecture / SOLID': { category: 'practice' },
  'TDD':                     { category: 'practice', aliases: ['Test-Driven Development (TDD)'] },
  'BDD':                     { category: 'practice', aliases: ['Behavior-Driven Development (BDD)'] },
  'Component-driven development': { category: 'practice', aliases: ['Component-Driven Development'] },
  'Code review & pair programming': { category: 'practice', aliases: ['Code Review & Pair Programming'] },
  'Agile / Scrum':           { category: 'practice' },
  'Core Web Vitals':         { category: 'practice', aliases: ['Performance Engineering (Web Vitals)', 'Web Vitals (FCP, TTI)'] },
  'Accessibility (a11y)':    { category: 'practice', aliases: ['Accessibility-first Development'] },
  'SEO':                     { category: 'practice' },
  'i18n':                    { category: 'practice' },
  'Atomic Design':           { category: 'practice' },
  'Design systems & tokens': { category: 'practice', aliases: ['Design Tokens & Design Systems'] },
  'Code splitting & lazy loading': { category: 'practice', aliases: ['Code Splitting & Lazy Loading'] },
  'Spec-driven development': { category: 'practice', aliases: ['Spec-Driven Development'] },
  'Issue-driven development': { category: 'practice', aliases: ['Issue-Driven Development'] },
  'Prompt engineering':      { category: 'practice', aliases: ['Prompt Engineering'] },
  'Vibe coding':             { category: 'practice', aliases: ['Vibe Coding'] },
  'Agent guardrails':        { category: 'practice', aliases: ['Agent Guardrails (Skills, Hooks, Subagents)'] },
  'Server vs client state':  { category: 'practice', aliases: ['Server State vs Client State (React Query + Zustand)'] },
  'Isolated worker services': { category: 'practice', aliases: ['Isolated Worker Services'] },
  'Security by design':      { category: 'practice', aliases: ['Security by Design (RLS, CSP)'] },
}

// One string that names several techs.
const SPLITS: Record<string, string[]> = {
  'TanStack Start/Router':                ['TanStack Start', 'TanStack Router'],
  'SSR / SSG / React Server Components':  ['SSR', 'SSG', 'React Server Components'],
  'Git & GitHub':                         ['Git', 'GitHub'],
  'GPT / AI Agents':                      ['OpenAI GPT', 'AI agents'],
}

const BY_KEY = new Map<string, string>()
for (const [name, { aliases = [] }] of Object.entries(CANONICAL)) {
  for (const spelling of [name, ...aliases]) {
    const key = techKey(spelling)
    const existing = BY_KEY.get(key)
    if (existing && existing !== name) throw new Error(`"${spelling}" maps to both ${existing} and ${name}`)
    BY_KEY.set(key, name)
  }
}

/** Canonical names for one raw string; [] when it is unknown. */
export function normalizeTech(raw: string): string[] {
  const split = Object.entries(SPLITS).find(([k]) => techKey(k) === techKey(raw))
  if (split) return split[1]
  const name = BY_KEY.get(techKey(raw))
  return name ? [name] : []
}

// ---------------------------------------------------------------------------
// Portable Text and keys
// ---------------------------------------------------------------------------

/** Stable array `_key` from a path. Only for array items, never for `_id`. */
export function keyFor(...parts: (string | number)[]) {
  return createHash('sha1').update(parts.join('/')).digest('hex').slice(0, 12)
}

export type Block = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: []
  listItem?: 'bullet'
  level?: 1
  children: { _type: 'span'; _key: string; text: string; marks: [] }[]
}

function block(text: string, key: string, bullet = false): Block {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    ...(bullet ? { listItem: 'bullet' as const, level: 1 as const } : {}),
    children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
  }
}

/** Paragraphs (split on blank lines) followed by bullet items. */
export function toBlocks(prose: string, bullets: string[], keyBase: string): Block[] {
  const paragraphs = prose.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return [
    ...paragraphs.map((p, i) => block(p, keyFor(keyBase, 'p', i))),
    ...bullets.map((b, i) => block(b, keyFor(keyBase, 'li', i), true)),
  ]
}

export function localeBlock(perLocale: (locale: Locale) => Block[]) {
  return {
    _type: 'localeBlock' as const,
    en: perLocale('en'),
    pt: perLocale('pt'),
    es: perLocale('es'),
  }
}

// ---------------------------------------------------------------------------
// Role matching
// ---------------------------------------------------------------------------

export type RoleLike = { id: string; company: string; startDate: string; endDate?: string | null }
export type ProjectLike = { title: string; startDate: string; endDate?: string | null }

const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function overlaps(a: { startDate: string; endDate?: string | null }, b: { startDate: string; endDate?: string | null }) {
  const aEnd = a.endDate ?? '9999-12-31'
  const bEnd = b.endDate ?? '9999-12-31'
  return a.startDate <= bEnd && b.startDate <= aEnd
}

/**
 * A project belongs to the role whose company it names ("Redação Online –
 * …", "… (Capitual)"). Otherwise it can only belong to a freelance role whose
 * dates overlap; named employers are never matched on dates alone. Returns
 * null when nothing (or more than one role) fits.
 */
export function matchRole(project: ProjectLike, roles: RoleLike[]): { id: string; by: 'company' | 'dates' } | null {
  const title = fold(project.title)
  const named = roles.filter((r) => title.includes(fold(r.company.replace(/\s*\(.*\)$/, ''))))
  if (named.length === 1) return { id: named[0].id, by: 'company' }
  const freelance = roles.filter((r) => /^freelance/i.test(r.company) && overlaps(r, project))
  if (freelance.length === 1) return { id: freelance[0].id, by: 'dates' }
  return null
}
