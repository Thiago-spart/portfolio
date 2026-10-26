// Builds the new-model documents (#46) from snapshot.ndjson.
//
//   node sanity/migrations/content-model/build.ts          (Node 23.6+ strips types)
//   npx tsx sanity/migrations/content-model/build.ts       (older Node)
//
// Reads:  snapshot.ndjson (published docs from the public read API)
//         ids.json        (document ids from earlier runs, if present)
// Writes: new-documents.ndjson, ids.json
//
// Only creates new documents (tech, role, caseStudy, faq, siteSettings). It
// never deletes or patches the old ones; nothing here talks to Sanity.
//
// Ids: ordinary documents get a random UUID the first time and keep it in
// ids.json, so rebuilding after an edit doesn't reshuffle references. Only
// siteSettings has a fixed id. Array `_key`s are hashes of their path.
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CANONICAL, TECH_CATEGORIES, keyFor, localeBlock, matchRole, normalizeTech,
  parseMetricValue, toBlocks, toMetricNumbers, type L10n, type Locale, type TechCategory,
} from './mapping.ts'
import {
  ALT_BY_ASSET, AVAILABILITY, COMPANY_URL_OVERRIDES, CONTACT, FAQ_KEEP, FEATURED, HERO_RESULTS,
  FAQ_CUT_REASONS, HIGHLIGHTS_FOLDED_INTO_RESULTS, METRICS, MISFITS, ROLE_SUMMARIES, SEO, SKILL_CATEGORY_DEFAULTS, TRIM_UNUSED_IN,
} from './content.ts'

// Snapshot documents are untyped JSON.
type Doc = { _id: string; _type: string; [field: string]: any }
type Loc = { _type?: string } & Partial<L10n>
type Ref = { _type: 'reference'; _ref: string }

const ls = (v: L10n | Loc) => ({ _type: 'localeString', en: v.en, pt: v.pt, es: v.es })
const lt = (v: L10n | Loc) => ({ _type: 'localeText', en: v.en, pt: v.pt, es: v.es })
const ref = (id: string): Ref => ({ _type: 'reference', _ref: id })
const refItem = (id: string, ...keyPath: string[]) => ({ ...ref(id), _key: keyFor(...keyPath, id) })
const clean = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as T

type Report = {
  techs: { name: string; category: TechCategory; from: string[]; usedBy: number }[]
  dropped: { name: string; category: string; reason: string }[]
  roleMatches: { slug: string; role: string | null; by: string }[]
  metrics: { target: string; id: string; source: string; raw: string; stored: string; note?: string }[]
  hero: { slug: string; metric: string; resultKey: string; display: string }[]
  misfits: typeof MISFITS
  faqLeftOut: { question: string; reason: string }[]
  counts: Record<string, number>
}

/** Pure: snapshot docs (+ an id source) → new docs and a report. */
export function buildDocuments(snapshot: Doc[], idFor: (sourceKey: string) => string) {
  const byType = (t: string) => snapshot.filter((d) => d._type === t)
  const experiences = byType('experience')
  const projects = byType('project')
  const qas = byType('qa')
  const skillCategories = byType('skillCategory')

  // ---------------------------------------------------------------- tech
  const used = new Map<string, number>() // canonical name → number of stacks using it
  const stackOf = (raw: string[] | undefined, where: string) => {
    const names: string[] = []
    for (const s of raw ?? []) {
      const canon = normalizeTech(s)
      if (canon.length === 0) throw new Error(`Unknown tech "${s}" in ${where}: add it to CANONICAL in mapping.ts`)
      for (const n of canon) if (!names.includes(n)) names.push(n)
    }
    return names
  }
  const stacks = new Map<string, string[]>()
  for (const d of [...experiences, ...projects]) {
    const names = stackOf(d.techStack, `${d._type} ${d._id}`)
    stacks.set(d._id, names)
    for (const n of names) used.set(n, (used.get(n) ?? 0) + 1)
  }

  const techs = new Map<string, { category: TechCategory; from: Set<string> }>()
  const dropped: Report['dropped'] = []
  const addTech = (name: string, raw: string) => {
    const t = techs.get(name) ?? { category: CANONICAL[name].category, from: new Set<string>() }
    t.from.add(raw)
    techs.set(name, t)
  }
  for (const cat of skillCategories) {
    const title = cat.category?.en as string
    if (!(title in SKILL_CATEGORY_DEFAULTS)) throw new Error(`Unknown skill category "${title}"`)
    for (const skill of cat.skills ?? []) {
      const raw = skill.name as string
      if (SKILL_CATEGORY_DEFAULTS[title] === null) {
        dropped.push({ name: raw, category: title, reason: 'Operating Systems category dropped (#43)' })
        continue
      }
      const canon = normalizeTech(raw)
      if (canon.length === 0) throw new Error(`Unknown skill "${raw}": add it to CANONICAL in mapping.ts`)
      for (const name of canon) {
        const category = CANONICAL[name].category
        if (TRIM_UNUSED_IN.includes(category) && !used.has(name)) {
          dropped.push({ name: raw === name ? name : `${raw} (→ ${name})`, category: title, reason: `Not in any role or case study stack (${category} trimmed, #43)` })
          continue
        }
        addTech(name, raw)
      }
    }
  }
  for (const d of [...experiences, ...projects]) {
    for (const raw of d.techStack ?? []) for (const name of normalizeTech(raw)) addTech(name, raw)
  }

  const techIds = new Map<string, string>()
  const techDocs: Doc[] = [...techs.keys()]
    .sort((a, b) => TECH_CATEGORIES.indexOf(techs.get(a)!.category) - TECH_CATEGORIES.indexOf(techs.get(b)!.category) || a.localeCompare(b))
    .map((name) => {
      const _id = idFor(`tech:${name}`)
      techIds.set(name, _id)
      return { _id, _type: 'tech', name, category: techs.get(name)!.category }
    })
  const stackRefs = (oldId: string) => {
    const names = stacks.get(oldId) ?? []
    return names.length ? names.map((n) => refItem(techIds.get(n)!, 'stack')) : undefined
  }

  // ---------------------------------------------------------------- roles
  const roleIds = new Map<string, string>()
  const roleDocs: Doc[] = experiences
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
    .map((e) => {
      const _id = idFor(`role:${e._id}`)
      roleIds.set(e._id, _id)
      const summary = ROLE_SUMMARIES[e._id]
      if (!summary) throw new Error(`No summary drafted for experience ${e._id} (${e.company})`)
      const companyUrl = e._id in COMPANY_URL_OVERRIDES ? COMPANY_URL_OVERRIDES[e._id] : e.companyUrl
      return clean({
        _id,
        _type: 'role',
        company: e.company,
        companyUrl,
        title: ls(e.role),
        startDate: e.startDate,
        endDate: e.endDate,
        summary: lt(summary),
        stack: stackRefs(e._id),
      })
    })

  // ---------------------------------------------------------------- case studies
  const roleCandidates = experiences.map((e) => ({ id: e._id, company: e.company, startDate: e.startDate, endDate: e.endDate }))
  const roleMatches: Report['roleMatches'] = []
  const metricsReport: Report['metrics'] = []
  const resultKeys = new Map<string, string>() // `${slug}:${metricId}` → _key
  const caseStudyIds = new Map<string, string>() // slug → _id

  const knownSlugs = new Set(projects.map((p) => p.slug.current))
  for (const m of METRICS) if (!knownSlugs.has(m.target)) throw new Error(`Metric "${m.id}" targets unknown slug ${m.target}`)
  for (const s of FEATURED) if (!knownSlugs.has(s)) throw new Error(`Featured slug ${s} not found`)

  const caseStudyDocs: Doc[] = projects
    .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)) || a.slug.current.localeCompare(b.slug.current))
    .map((p) => {
      const slug: string = p.slug.current
      const _id = idFor(`caseStudy:${p._id}`)
      caseStudyIds.set(slug, _id)

      const match = matchRole({ title: p.title.en, startDate: p.startDate, endDate: p.endDate }, roleCandidates)
      roleMatches.push({ slug, role: match ? experiences.find((e) => e._id === match.id)!.company : null, by: match?.by ?? 'unmatched' })

      const results = METRICS.filter((m) => m.target === slug).map((m) => {
        const parsed = parseMetricValue(m.raw)
        if (!parsed) throw new Error(`Metric ${slug}/${m.id}: cannot parse "${m.raw}"`)
        const numbers = toMetricNumbers(parsed, m.direction, Boolean(m.isChange))
        const _key = keyFor('metric', slug, m.id)
        resultKeys.set(`${slug}:${m.id}`, _key)
        const notes = [
          parsed.atLeast ? `"${m.raw}" stored as ${numbers.after}: the "+" is lost` : null,
          parsed.signed && numbers.after > 0 ? 'the "+" sign is lost (renders as a level)' : null,
          m.isChange && m.direction === 'down' ? 'reduction stored as a negative after' : null,
        ].filter(Boolean)
        metricsReport.push({ target: slug, id: m.id, source: m.source, raw: m.raw, stored: JSON.stringify({ ...numbers, direction: m.direction }), note: notes.join('; ') || undefined })
        return { _type: 'metric', _key, ...numbers, label: ls(m.label), direction: m.direction }
      })

      const paragraphs = (loc: Locale) => (p.longDescription[loc] as string).split(/\n\s*\n/)
      const folded = HIGHLIGHTS_FOLDED_INTO_RESULTS[slug] ?? []
      const problem = localeBlock((loc) => toBlocks(
        paragraphs(loc)[0],
        (p.challenges ?? []).map((c: Loc) => c[loc]!),
        `problem/${slug}/${loc}`,
      ))
      const approach = localeBlock((loc) => toBlocks(
        paragraphs(loc).slice(1).join('\n\n'),
        (p.highlights ?? []).filter((_: unknown, i: number) => !folded.includes(i)).map((h: Loc) => h[loc]!),
        `approach/${slug}/${loc}`,
      ))

      const image = (img: any, ...keyPath: string[]) => {
        const assetRef: string | undefined = img?.asset?._ref
        if (!assetRef) return undefined
        const alt = ALT_BY_ASSET[assetRef]
        if (!alt) throw new Error(`No alt text drafted for ${assetRef}`)
        return clean({
          _type: 'imageWithAlt',
          ...(keyPath.length ? { _key: keyFor(...keyPath) } : {}),
          asset: ref(assetRef),
          hotspot: img.hotspot,
          crop: img.crop,
          alt: ls(alt),
        })
      }
      const gallery = (p.gallery ?? []).map((g: any, i: number) => image(g, 'gallery', slug, String(i))).filter(Boolean)

      const featuredAt = FEATURED.indexOf(slug)
      return clean({
        _id,
        _type: 'caseStudy',
        title: ls(p.title),
        slug: { _type: 'slug', current: slug },
        role: match ? ref(roleIds.get(match.id)!) : undefined,
        tier: featuredAt >= 0 ? 'featured' : 'archive',
        order: featuredAt >= 0 ? featuredAt + 1 : undefined,
        summary: p.shortDescription ? ls(p.shortDescription) : undefined,
        problem,
        approach,
        results: results.length ? results : undefined,
        stack: stackRefs(p._id),
        cover: image(p.coverImage),
        gallery: gallery.length ? gallery : undefined,
        video: p.video ?? undefined, // same file asset reference, no re-upload
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        startDate: p.startDate,
        endDate: p.endDate,
      })
    })

  // ---------------------------------------------------------------- faq
  const faqDocs: Doc[] = qas
    .filter((q) => q._id in FAQ_KEEP)
    .sort((a, b) => FAQ_KEEP[a._id] - FAQ_KEEP[b._id])
    .map((q) => ({
      _id: idFor(`faq:${q._id}`),
      _type: 'faq',
      question: ls(q.question),
      answer: localeBlock((loc) => toBlocks(q.answer[loc], [], `faq/${q._id}/${loc}`)),
      order: FAQ_KEEP[q._id],
    }))

  // ---------------------------------------------------------------- siteSettings
  const hero: Report['hero'] = []
  const heroResults = HERO_RESULTS.map(({ slug, metric }) => {
    const resultKey = resultKeys.get(`${slug}:${metric}`)
    const caseStudy = caseStudyIds.get(slug)
    if (!resultKey || !caseStudy) throw new Error(`Hero result ${slug}/${metric} has no source metric`)
    const m = metricsReport.find((r) => r.target === slug && r.id === metric)
    hero.push({ slug, metric, resultKey, display: m?.stored ?? '' })
    return { _type: 'heroResult', _key: keyFor('hero', slug, metric), caseStudy: ref(caseStudy), resultKey }
  })
  const siteSettings: Doc = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    availability: ls(AVAILABILITY),
    heroResults,
    email: CONTACT.email,
    linkedin: CONTACT.linkedin,
    github: CONTACT.github,
    seo: { title: ls(SEO.title), description: lt(SEO.description) },
  }

  const docs = [...techDocs, ...roleDocs, ...caseStudyDocs, ...faqDocs, siteSettings]
  const report: Report = {
    techs: techDocs.map((t) => ({ name: t.name as string, category: t.category as TechCategory, from: [...techs.get(t.name as string)!.from], usedBy: used.get(t.name as string) ?? 0 })),
    dropped,
    roleMatches,
    metrics: metricsReport,
    hero,
    misfits: MISFITS,
    faqLeftOut: qas.filter((q) => !(q._id in FAQ_KEEP)).map((q) => ({ question: q.question.en, reason: FAQ_CUT_REASONS[q._id] ?? 'no reason recorded' })),
    counts: {
      'experience → role': roleDocs.length,
      'project → caseStudy': caseStudyDocs.length,
      'qa → faq': faqDocs.length,
      'skills + stacks → tech': techDocs.length,
      siteSettings: 1,
    },
  }
  return { docs, report }
}

export function readNdjson(path: string): Doc[] {
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const idsPath = join(here, 'ids.json')
  const ids: Record<string, string> = existsSync(idsPath) ? JSON.parse(readFileSync(idsPath, 'utf8')) : {}
  const seen = new Set<string>()
  const idFor = (key: string) => {
    seen.add(key)
    return (ids[key] ??= randomUUID())
  }

  const { docs, report } = buildDocuments(readNdjson(join(here, 'snapshot.ndjson')), idFor)

  // Keep only ids still in use, sorted, so the file diff stays readable.
  const kept = Object.fromEntries(Object.entries(ids).filter(([k]) => seen.has(k)).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(idsPath, JSON.stringify(kept, null, 2) + '\n')
  writeFileSync(join(here, 'new-documents.ndjson'), docs.map((d) => JSON.stringify(d)).join('\n') + '\n')

  if (process.argv.includes('--report')) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(Object.entries(report.counts).map(([k, v]) => `${k}: ${v}`).join('\n'))
    console.log(`dropped techs: ${report.dropped.length}`)
    console.log(`unmatched case studies: ${report.roleMatches.filter((m) => !m.role).map((m) => m.slug).join(', ') || 'none'}`)
    console.log(`wrote ${docs.length} documents to new-documents.ndjson`)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()

