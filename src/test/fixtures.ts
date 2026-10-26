// Builders for new-model content (sanity/schemas). The dataset has no
// new-model documents until the migration (#46), so tests use these.
import type {
  CASE_STUDIES_QUERY_RESULT,
  LocaleBlock,
  LocaleString,
  LocaleText,
} from '../types/sanity.generated'

type Translations = { en: string; pt?: string; es?: string }

export function localeString({ en, pt = `${en} (pt)`, es = `${en} (es)` }: Translations): LocaleString {
  return { _type: 'localeString', en, pt, es }
}

export function localeText({ en, pt = `${en} (pt)`, es = `${en} (es)` }: Translations): LocaleText {
  return { _type: 'localeText', en, pt, es }
}

type Blocks = LocaleBlock['en']

/** One Portable Text paragraph per string. */
export function paragraphs(...texts: string[]): Blocks {
  return texts.map((text, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
  }))
}

export function localeBlock(en: Blocks, pt: Blocks = en, es: Blocks = en): LocaleBlock {
  return { _type: 'localeBlock', en, pt, es }
}

export function metric(
  after: number,
  label: string,
  { before = null, unit = null, direction = 'up', key = label }: {
    before?: number | null
    unit?: string | null
    direction?: 'up' | 'down'
    key?: string
  } = {},
) {
  return { _key: key, before, after, unit, label: localeString({ en: label }), direction }
}

/** A CASE_STUDIES_QUERY row (home page card). */
export function caseStudyCard(overrides: Partial<CASE_STUDIES_QUERY_RESULT[number]> = {}): CASE_STUDIES_QUERY_RESULT[number] {
  return {
    _id: 'cs-1',
    title: localeString({ en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' }),
    slug: 'portfolio-site',
    tier: 'featured',
    summary: localeString({ en: 'A personal site.', pt: 'Um site pessoal.', es: 'Un sitio personal.' }),
    cover: { url: 'https://example.com/cover.jpg', alt: localeString({ en: 'Home page on a laptop' }) },
    stack: ['React', 'TypeScript'],
    headlineResult: metric(95, 'Lighthouse score', { before: 40 }),
    ...overrides,
  }
}
