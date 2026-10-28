import type { Lang } from '#/i18n/LanguageContext'
import type { STACK_QUERY_RESULT } from '#/types/sanity.generated'

type Tech     = STACK_QUERY_RESULT['techs'][number]
type Category = Tech['category']

// The Stack section's rows, in display order. Backend and data share a row
// ("Backend & data"); every other row is one tech.category (values from
// sanity/schemas/tech.ts). AI tools have no row: agents are how the work
// gets done, not what's on offer (PRODUCT.md).
const GROUPS = [
  { key: 'frontend', categories: ['frontend'], label: { en: 'Frontend', pt: 'Frontend', es: 'Frontend' } },
  { key: 'mobile', categories: ['mobile'], label: { en: 'Mobile', pt: 'Mobile', es: 'Móvil' } },
  { key: 'testing', categories: ['testing'], label: { en: 'Testing', pt: 'Testes', es: 'Pruebas' } },
  {
    key: 'backend',
    categories: ['backend', 'data'],
    label: { en: 'Backend & data', pt: 'Backend e dados', es: 'Backend y datos' },
  },
  { key: 'tooling', categories: ['tooling'], label: { en: 'Tooling', pt: 'Ferramentas', es: 'Herramientas' } },
  { key: 'practice', categories: ['practice'], label: { en: 'Practice', pt: 'Práticas', es: 'Prácticas' } },
] as const satisfies ReadonlyArray<{
  key: string
  categories: ReadonlyArray<Category>
  label: Record<Lang, string>
}>

type StackGroupKey = (typeof GROUPS)[number]['key']

// The main stack, drawn as core Tags.
const CORE = new Set(['React', 'React Native', 'TypeScript'])

// A tech shows up front once this many case studies use it (core techs
// always do); the rest wait behind "+N more".
const FEATURED_MIN_USES = 3

interface StackTech {
  name: string
  // How many case studies reference the tech (0 when only a role does).
  count: number
  core: boolean
  featured: boolean
}

export interface StackGroup {
  key: StackGroupKey
  label: Record<Lang, string>
  // Most-used first, then by name.
  techs: StackTech[]
}

/** Groups the techs in use into the Stack rows, in GROUPS order; empty rows are left out. */
export function groupStack(techs: STACK_QUERY_RESULT['techs']): StackGroup[] {
  return GROUPS.map(({ key, categories, label }) => ({
    key,
    label,
    techs: techs
      .filter((tech) => (categories as ReadonlyArray<Category>).includes(tech.category))
      .map((tech) => {
        const core = CORE.has(tech.name)
        return { name: tech.name, count: tech.caseStudies, core, featured: core || tech.caseStudies >= FEATURED_MIN_USES }
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en')),
  })).filter((group) => group.techs.length > 0)
}
