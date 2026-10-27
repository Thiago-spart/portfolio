import type { Lang } from '#/i18n/LanguageContext'
import type { STACK_QUERY_RESULT } from '#/types/sanity.generated'

type Tech     = STACK_QUERY_RESULT[number]
type Category = Tech['category']

// Display order and labels for tech.category (values from sanity/schemas/tech.ts).
const CATEGORIES: Record<Category, Record<Lang, string>> = {
  frontend: { en: 'Frontend', pt: 'Frontend',    es: 'Frontend' },
  mobile:   { en: 'Mobile',   pt: 'Mobile',      es: 'Móvil' },
  backend:  { en: 'Backend',  pt: 'Backend',     es: 'Backend' },
  data:     { en: 'Data',     pt: 'Dados',       es: 'Datos' },
  testing:  { en: 'Testing',  pt: 'Testes',      es: 'Pruebas' },
  tooling:  { en: 'Tooling',  pt: 'Ferramentas', es: 'Herramientas' },
  ai:       { en: 'AI',       pt: 'IA',          es: 'IA' },
  practice: { en: 'Practice', pt: 'Práticas',    es: 'Prácticas' },
}

export interface StackGroup {
  category: Category
  label: Record<Lang, string>
  techs: string[]
}

/** Groups the techs in use by category, in CATEGORIES order; empty groups are left out. */
export function groupStack(techs: STACK_QUERY_RESULT): StackGroup[] {
  return (Object.keys(CATEGORIES) as Category[])
    .map((category) => ({
      category,
      label: CATEGORIES[category],
      techs: techs.filter((t) => t.category === category).map((t) => t.name),
    }))
    .filter((group) => group.techs.length > 0)
}
