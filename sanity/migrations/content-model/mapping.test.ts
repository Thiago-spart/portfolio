import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { matchRole, normalizeTech, parseMetricValue, techKey, toBlocks, toMetricNumbers, TECH_CATEGORIES } from './mapping.ts'
import { buildDocuments, readNdjson } from './build.ts'
import { assetIdsIn, DIRECTIONS, TIERS, validateDocuments } from './validate.ts'
import { tech } from '../../schemas/tech'
import { caseStudy } from '../../schemas/caseStudy'
import { metric, formatMetric } from '../../schemas/objects/metric'
import { distinctHeroResults } from '../../schemas/siteSettings'

const listValues = (type: { fields?: readonly { name: string; options?: unknown }[] }, name: string) =>
  ((type.fields?.find((f) => f.name === name)?.options as { list: { value: string }[] }).list).map((o) => o.value)

describe('parseMetricValue', () => {
  it.each([
    ['40 → 95',   { before: 40, after: 95 }],
    ['23% → 9%',  { before: 23, after: 9, unit: '%' }],
    ['3.5 → 4.8', { before: 3.5, after: 4.8 }],
    ['4wk → 3wk', { before: 4, after: 3, unit: 'wk' }],
    ['+40%',      { after: 40, unit: '%', signed: true }],
    ['−96%',      { after: -96, unit: '%', signed: true }],
    ['-96%',      { after: -96, unit: '%', signed: true }],
    ['96%',       { after: 96, unit: '%' }],
    ['0.9s',      { after: 0.9, unit: 's' }],
    ['0,9s',      { after: 0.9, unit: 's' }],
    ['90+',       { after: 90, atLeast: true }],
    ['80%+',      { after: 80, unit: '%', atLeast: true }],
    ['100',       { after: 100 }],
  ])('parses %s', (raw, expected) => {
    expect(parseMetricValue(raw)).toEqual(expected)
  })

  it.each(['Next.js SSG + BFF', 'Storybook & E2E', '95+/98+', '70k+', '3 wks', 'PWA', '4% → 3s', ''])(
    'returns null for %j (not one measurement)',
    (raw) => expect(parseMetricValue(raw)).toBeNull(),
  )
})

describe('toMetricNumbers', () => {
  it('stores a reduction without a baseline as a negative after', () => {
    expect(toMetricNumbers(parseMetricValue('96%')!, 'down', true)).toEqual({ after: -96, unit: '%' })
  })

  it('leaves an already negative reduction alone', () => {
    expect(toMetricNumbers(parseMetricValue('−96%')!, 'down', true)).toEqual({ after: -96, unit: '%' })
  })

  it('keeps levels and before → after pairs as written', () => {
    expect(toMetricNumbers(parseMetricValue('80%')!, 'up', false)).toEqual({ after: 80, unit: '%' })
    expect(toMetricNumbers(parseMetricValue('23% → 9%')!, 'down', false)).toEqual({ before: 23, after: 9, unit: '%' })
    expect(toMetricNumbers(parseMetricValue('0.9s')!, 'down', false)).toEqual({ after: 0.9, unit: 's' })
  })

  it('renders the hero numbers the way the schema preview formats them', () => {
    expect(formatMetric(toMetricNumbers(parseMetricValue('40 → 95')!, 'up', false))).toBe('40 → 95')
    expect(formatMetric(toMetricNumbers(parseMetricValue('96%')!, 'down', true))).toBe('-96%')
    expect(formatMetric(toMetricNumbers(parseMetricValue('23% → 9%')!, 'down', false))).toBe('23% → 9%')
  })
})

describe('tech normalization', () => {
  it.each([
    ['Next.js', 'NextJS', 'nextjs', 'next.js'],
    ['React', 'React.js', 'react', 'ReactJS'],
    ['Vue', 'Vue.js', 'VueJS'],
    ['Node.js', 'NodeJS', 'node'],
    ['TanStack Query', 'React Query', 'react-query'],
    ['React Testing Library', 'RTL', 'React Testing Library (RTL)'],
    ['styled-components', 'Styled Components'],
    ['daisyUI', 'DaisyUI'],
    ['shadcn/ui', 'Shadcn UI'],
    ['Micro-frontends', 'Micro-Frontends', 'Micro-Frontend Architecture'],
    ['MCP', 'MCP Servers', 'MCP (Model Context Protocol)'],
  ])('maps every spelling of %s to it', (canonical, ...spellings) => {
    for (const s of [canonical, ...spellings]) expect(normalizeTech(s)).toEqual([canonical])
  })

  it('splits strings that name several techs', () => {
    expect(normalizeTech('TanStack Start/Router')).toEqual(['TanStack Start', 'TanStack Router'])
    expect(normalizeTech('Git & GitHub')).toEqual(['Git', 'GitHub'])
  })

  it('returns [] for unknown names so the build can fail loudly', () => {
    expect(normalizeTech('Arch Linux')).toEqual([])
  })

  it('keeps short names that end in "js" intact', () => {
    expect(techKey('ejs')).toBe('ejs')
  })

  it('uses the same category list as the tech schema', () => {
    expect([...TECH_CATEGORIES]).toEqual(listValues(tech, 'category'))
  })
})

describe('matchRole', () => {
  const roles = [
    { id: 'ro', company: 'Redação Online', startDate: '2023-02-01', endDate: '2025-01-31' },
    { id: 'cap', company: 'Capitual', startDate: '2021-10-01', endDate: '2022-11-30' },
    { id: 'fl', company: 'Freelance', startDate: '2025-01-01', endDate: null },
  ]

  it('matches by company name, ignoring accents', () => {
    expect(matchRole({ title: 'Redacao Online – Checkout', startDate: '2023-02-01' }, roles)).toEqual({ id: 'ro', by: 'company' })
    expect(matchRole({ title: 'Internal Tool (Capitual)', startDate: '2021-10-01' }, roles)).toEqual({ id: 'cap', by: 'company' })
  })

  it('falls back to an overlapping freelance role, never a named employer', () => {
    expect(matchRole({ title: 'C6 Bank', startDate: '2025-01-01', endDate: '2025-03-31' }, roles)).toEqual({ id: 'fl', by: 'dates' })
    expect(matchRole({ title: 'Bask', startDate: '2024-07-01', endDate: '2024-08-31' }, roles)).toBeNull()
  })
})

describe('toBlocks', () => {
  it('turns paragraphs and bullets into keyed Portable Text blocks', () => {
    const blocks = toBlocks('One.\n\nTwo.', ['A'], 'x')
    expect(blocks.map((b) => [b.children[0].text, b.listItem ?? null])).toEqual([['One.', null], ['Two.', null], ['A', 'bullet']])
    expect(new Set(blocks.map((b) => b._key)).size).toBe(3)
  })
})

describe('build + validate on the committed snapshot', () => {
  const dir = join(__dirname)
  const snapshot = readNdjson(join(dir, 'snapshot.ndjson'))
  let n = 0
  const { docs, report } = buildDocuments(snapshot, () => `id-${++n}`)

  it('produces documents that pass the validator', () => {
    const issues = validateDocuments(docs, { assetIds: assetIdsIn(snapshot), legacyIds: new Set(snapshot.map((d) => d._id)) })
    expect(issues).toEqual([])
  })

  it('only creates new-model documents', () => {
    expect(new Set(docs.map((d) => d._type))).toEqual(new Set(['tech', 'role', 'caseStudy', 'faq', 'siteSettings']))
  })

  it('keeps every project slug', () => {
    const slugs = (s: { _type: string; slug?: { current: string } }[], t: string) => s.filter((d) => d._type === t).map((d) => d.slug!.current).sort()
    expect(slugs(docs as never, 'caseStudy')).toEqual(slugs(snapshot as never, 'project'))
  })

  it('reuses existing image assets only (no new uploads)', () => {
    const used = assetIdsIn(docs)
    expect(used.size).toBeGreaterThan(0)
    for (const id of used) expect(assetIdsIn(snapshot).has(id)).toBe(true)
  })

  it('backs all three hero results with a case study metric, none picked twice', () => {
    const settings = docs.find((d) => d._type === 'siteSettings') as unknown as { heroResults: { caseStudy: { _ref: string }; resultKey: string }[] }
    expect(report.hero.map((h) => h.metric)).toEqual(['lighthouse', 'production-bugs', 'checkout-dropoff'])
    expect(distinctHeroResults(settings.heroResults)).toBe(true)
  })

  it('drops every Operating Systems skill', () => {
    const os = report.dropped.filter((d) => d.category === 'Operating Systems').map((d) => d.name)
    expect(os).toContain('Arch Linux')
    expect(docs.some((d) => d._type === 'tech' && /linux|ubuntu|windows|macos/i.test(String(d.name)))).toBe(false)
  })

  it('validator lists match the schema options', () => {
    expect(TIERS).toEqual(listValues(caseStudy, 'tier'))
    expect(DIRECTIONS).toEqual(listValues(metric, 'direction'))
  })

  it('validator catches a broken hero result', () => {
    const broken = docs.map((d) => (d._type === 'siteSettings'
      ? { ...d, heroResults: (d.heroResults as object[]).slice(0, 2).map((h) => ({ ...h, resultKey: 'nope' })) }
      : d))
    const messages = validateDocuments(broken).map((i) => i.message)
    expect(messages).toContain('needs exactly 3 items, has 2')
    expect(messages).toContain('This result is not in the case study')
  })
})

// Guard: the file the user will import must stay valid after hand edits.
describe('committed new-documents.ndjson', () => {
  it('is valid', () => {
    const dir = join(__dirname)
    const docs = readFileSync(join(dir, 'new-documents.ndjson'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    const snapshot = readNdjson(join(dir, 'snapshot.ndjson'))
    expect(validateDocuments(docs, { assetIds: assetIdsIn(snapshot), legacyIds: new Set(snapshot.map((d) => d._id)) })).toEqual([])
  })
})
