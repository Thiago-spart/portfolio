import { describe, it, expect, vi } from 'vitest'
import { evaluate, parse } from 'groq-js'
import { localeBlock, localeString, localeText, metric, paragraphs } from './fixtures'

// Only the GROQ strings are under test here, not the server functions.
vi.mock('@tanstack/react-start', () => {
  const builder = { validator: () => builder, handler: () => () => undefined }
  return { createServerFn: () => builder }
})

const { CASE_STUDIES_QUERY, CASE_STUDY_DETAIL_QUERY } = await import('../lib/queries/caseStudies')
const { ROLES_QUERY }                                 = await import('../lib/queries/roles')
const { STACK_QUERY }                                 = await import('../lib/queries/stack')
const { FAQ_QUERY }                                   = await import('../lib/queries/faq')
const { SITE_SETTINGS_QUERY, HERO_RESULTS_QUERY }     = await import('../lib/queries/siteSettings')

// A small new-model dataset (sanity/schemas). Real documents arrive with the
// migration (#46); until then this is what the queries are checked against.
const ref = (id: string, key?: string) => ({ _type: 'reference', _ref: id, ...(key ? { _key: key } : {}) })
const image = (assetId: string, alt: string) => ({
  _type: 'imageWithAlt',
  asset: ref(assetId),
  alt: localeString({ en: alt }),
})

const dataset = [
  { _id: 'image-cover-1', _type: 'sanity.imageAsset', url: 'https://cdn.sanity.io/images/p/d/cover-1.jpg' },
  { _id: 'image-shot-1',  _type: 'sanity.imageAsset', url: 'https://cdn.sanity.io/images/p/d/shot-1.png' },

  { _id: 'tech-react',  _type: 'tech', name: 'React',   category: 'frontend' },
  { _id: 'tech-node',   _type: 'tech', name: 'Node.js', category: 'backend' },
  { _id: 'tech-vitest', _type: 'tech', name: 'Vitest',  category: 'testing' },
  { _id: 'tech-cobol',  _type: 'tech', name: 'COBOL',   category: 'backend' }, // referenced by nothing

  {
    _id: 'role-old', _type: 'role', company: 'Old Co', title: localeString({ en: 'Developer' }),
    startDate: '2019-01-01', endDate: '2021-12-31', stack: [ref('tech-node', 'k1')],
  },
  {
    _id: 'role-new', _type: 'role', company: 'New Co', title: localeString({ en: 'Lead' }),
    summary: localeText({ en: 'Leads the web team.' }), startDate: '2022-01-01',
    stack: [ref('tech-react', 'k1')],
  },

  {
    _id: 'cs-archive', _type: 'caseStudy', title: localeString({ en: 'Archive' }),
    slug: { _type: 'slug', current: 'archive' }, tier: 'archive', startDate: '2020-01-01',
    role: ref('role-old'),
  },
  {
    _id: 'cs-feat-2', _type: 'caseStudy', title: localeString({ en: 'Second' }),
    slug: { _type: 'slug', current: 'second' }, tier: 'featured', order: 2, role: ref('role-new'),
    results: [metric(9, 'Checkout drop-off', { before: 23, unit: '%', direction: 'down', key: 'drop' })],
  },
  {
    _id: 'cs-feat-1', _type: 'caseStudy', title: localeString({ en: 'First' }),
    slug: { _type: 'slug', current: 'first' }, tier: 'featured', order: 1, role: ref('role-new'),
    summary: localeString({ en: 'Made it fast.' }),
    problem: localeBlock(paragraphs('It was slow.')),
    approach: localeBlock(paragraphs('SSR.')),
    results: [
      metric(95, 'Lighthouse', { before: 40, key: 'lh' }),
      metric(-96, 'Production bugs', { unit: '%', direction: 'down', key: 'bugs' }),
    ],
    stack: [ref('tech-react', 'k1'), ref('tech-vitest', 'k2')],
    cover: image('image-cover-1', 'The new home page'),
    gallery: [{ ...image('image-shot-1', 'Checkout'), _key: 'g1' }],
  },
  // No role (e.g. Bask): on the cards and its page, never on the timeline.
  {
    _id: 'cs-solo', _type: 'caseStudy', title: localeString({ en: 'Solo' }),
    slug: { _type: 'slug', current: 'solo' }, tier: 'archive', startDate: '2024-07-01',
    results: [
      metric(40, 'Organic search', { unit: '%', qualifier: 'change', key: 'seo' }),
      metric(45, 'Components', { qualifier: 'atLeast', key: 'components' }),
    ],
  },
  // No slug yet: must not produce a /projects/undefined link.
  { _id: 'cs-draft', _type: 'caseStudy', title: localeString({ en: 'No slug' }), tier: 'archive', role: ref('role-new') },

  {
    _id: 'faq-2', _type: 'faq', order: 2, question: localeString({ en: 'Second?' }),
    answer: localeBlock(paragraphs('Two.')),
  },
  {
    _id: 'faq-1', _type: 'faq', order: 1, question: localeString({ en: 'First?' }),
    answer: localeBlock(paragraphs('One.', 'Still one.')),
  },

  {
    _id: 'siteSettings', _type: 'siteSettings',
    email: 'hi@example.com', github: 'https://github.com/someone',
    heroResults: [
      { _type: 'heroResult', _key: 'h1', caseStudy: ref('cs-feat-1'), resultKey: 'lh' },
      { _type: 'heroResult', _key: 'h2', caseStudy: ref('cs-feat-1'), resultKey: 'bugs' },
      { _type: 'heroResult', _key: 'h3', caseStudy: ref('cs-feat-2'), resultKey: 'drop' },
    ],
  },
]

async function run<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const value = await evaluate(parse(query, { params }), { dataset, params })
  return (await value.get()) as T
}

describe('CASE_STUDIES_QUERY', () => {
  it('lists featured case studies by order, then the archive; skips ones without a slug', async () => {
    const rows = await run<{ slug: string }[]>(CASE_STUDIES_QUERY)
    expect(rows.map((r) => r.slug)).toEqual(['first', 'second', 'solo', 'archive'])
  })

  it('projects the card fields: CDN-sized cover with alt, stack names, first result', async () => {
    const [first] = await run<any[]>(CASE_STUDIES_QUERY)
    expect(first.cover).toEqual({
      url: 'https://cdn.sanity.io/images/p/d/cover-1.jpg?w=700&h=500&fit=crop&auto=format&q=75',
      alt: localeString({ en: 'The new home page' }),
    })
    expect(first.stack).toEqual(['React', 'Vitest'])
    expect(first.headlineResult).toMatchObject({ _key: 'lh', before: 40, after: 95 })
  })
})

describe('CASE_STUDY_DETAIL_QUERY', () => {
  it('resolves the role, gallery, rich text and results for a slug', async () => {
    const study = await run<any>(CASE_STUDY_DETAIL_QUERY, { slug: 'first' })
    expect(study.role).toEqual({ company: 'New Co', companyUrl: null, title: localeString({ en: 'Lead' }) })
    expect(study.problem.en[0].children[0].text).toBe('It was slow.')
    expect(study.results.map((r: { _key: string }) => r._key)).toEqual(['lh', 'bugs'])
    expect(study.gallery).toEqual([{
      _key: 'g1',
      url: 'https://cdn.sanity.io/images/p/d/shot-1.png?w=1000&auto=format&q=75',
      alt: localeString({ en: 'Checkout' }),
    }])
  })

  it('returns a null role and the qualifiers for a case study without a role', async () => {
    const study = await run<any>(CASE_STUDY_DETAIL_QUERY, { slug: 'solo' })
    expect(study.role).toBeNull()
    expect(study.results).toMatchObject([
      { _key: 'seo', after: 40, unit: '%', qualifier: 'change' },
      { _key: 'components', after: 45, qualifier: 'atLeast' },
    ])
  })

  it('returns null for an unknown slug', async () => {
    expect(await run(CASE_STUDY_DETAIL_QUERY, { slug: 'nope' })).toBeNull()
  })
})

describe('ROLES_QUERY', () => {
  it('lists roles newest first, each with its case studies found by reverse lookup', async () => {
    const roles = await run<any[]>(ROLES_QUERY)
    expect(roles.map((r) => r.company)).toEqual(['New Co', 'Old Co'])
    expect(roles[0].caseStudies.map((c: { slug: string }) => c.slug)).toEqual(['first', 'second'])
    expect(roles[1].caseStudies.map((c: { slug: string }) => c.slug)).toEqual(['archive'])
    expect(roles.flatMap((r) => r.caseStudies.map((c: { slug: string }) => c.slug))).not.toContain('solo')
    expect(roles[0].stack).toEqual(['React'])
  })
})

describe('STACK_QUERY', () => {
  it('derives the stack from techs referenced by a case study or a role', async () => {
    const techs = await run<{ name: string }[]>(STACK_QUERY)
    // Node.js is only on a role; COBOL is on nothing.
    expect(techs.map((t) => t.name)).toEqual(['Node.js', 'React', 'Vitest'])
  })
})

describe('FAQ_QUERY', () => {
  it('orders questions by `order`', async () => {
    const faqs = await run<{ _id: string }[]>(FAQ_QUERY)
    expect(faqs.map((f) => f._id)).toEqual(['faq-1', 'faq-2'])
  })
})

describe('siteSettings queries', () => {
  it('reads contact links from the singleton', async () => {
    const settings = await run<any>(SITE_SETTINGS_QUERY)
    expect(settings).toMatchObject({ email: 'hi@example.com', linkedin: null, github: 'https://github.com/someone', seo: null })
  })

  it('resolves each hero result to the metric it points at', async () => {
    const results = await run<any[]>(HERO_RESULTS_QUERY)
    expect(results.map((r) => [r.caseStudy.slug, r.result?._key])).toEqual([
      ['first', 'lh'],
      ['first', 'bugs'],
      ['second', 'drop'],
    ])
    expect(results[2].result).toMatchObject({ before: 23, after: 9, unit: '%', direction: 'down' })
  })
})

describe('llms.txt FAQ projection', () => {
  it('flattens a rich-text answer to plain text with pt::text()', async () => {
    const [first] = await run<{ answer: string }[]>(
      `*[_type == "faq"] | order(order asc) { "answer": pt::text(answer.en) }`,
    )
    expect(first.answer).toBe('One.\n\nStill one.')
  })
})
