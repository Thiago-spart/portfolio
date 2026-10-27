// Builders for new-model content (sanity/schemas). The dataset has no
// new-model documents until the migration (#46), so tests use these.
import type {
  CASE_STUDIES_QUERY_RESULT,
  CASE_STUDY_DETAIL_QUERY_RESULT,
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
  { before = null, unit = null, qualifier = null, direction = 'up', key = label }: {
    before?: number | null
    unit?: string | null
    qualifier?: 'atLeast' | 'change' | null
    direction?: 'up' | 'down'
    key?: string
  } = {},
) {
  return { _key: key, before, after, unit, qualifier, label: localeString({ en: label }), direction }
}

/** A CASE_STUDIES_QUERY row (Case card or Archive row). */
export function caseStudyCard(overrides: Partial<CASE_STUDIES_QUERY_RESULT[number]> = {}): CASE_STUDIES_QUERY_RESULT[number] {
  return {
    _id: 'cs-1',
    title: localeString({ en: 'Portfolio Site', pt: 'Site Portfólio', es: 'Sitio Portafolio' }),
    slug: 'portfolio-site',
    tier: 'featured',
    summary: localeString({ en: 'A personal site.', pt: 'Um site pessoal.', es: 'Un sitio personal.' }),
    roleTitle: localeString({ en: 'Lead Frontend Engineer' }),
    startDate: '2023-02-01',
    endDate: '2025-01-31',
    stack: ['React', 'TypeScript'],
    results: [
      metric(95, 'Lighthouse score', { before: 40 }),
      metric(40, 'Organic search', { unit: '%', qualifier: 'change' }),
    ],
    ...overrides,
  }
}

type CaseStudyDetail = NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>

/** A CASE_STUDY_DETAIL_QUERY result (case-study page). */
export function caseStudyDetail(overrides: Partial<CaseStudyDetail> = {}): CaseStudyDetail {
  return {
    _id: 'cs-1',
    title: localeString({ en: 'Portfolio Site' }),
    slug: 'portfolio-site',
    summary: localeString({ en: 'A personal site.' }),
    problem: localeBlock(
      paragraphs('The old site scored 40 on Lighthouse.'),
      paragraphs('O site antigo tinha nota 40 no Lighthouse.'),
    ),
    approach: localeBlock(paragraphs('Rebuilt it with SSR.', 'Then trimmed the bundle.')),
    results: [
      metric(95, 'Lighthouse score', { before: 40 }),
      metric(40, 'Organic search', { unit: '%', qualifier: 'change' }),
    ],
    stack: ['React', 'TypeScript', 'Vitest'],
    role: { company: 'Acme Corp', companyUrl: null, title: localeString({ en: 'Senior Developer' }) },
    cover: { url: 'https://cdn.sanity.io/images/p/d/cover.jpg?w=2240', alt: localeString({ en: 'Home page on a laptop' }) },
    gallery: null,
    videoUrl: null,
    liveUrl: null,
    githubUrl: null,
    startDate: '2024-01-15',
    endDate: '2024-06-01',
    ...overrides,
  }
}
