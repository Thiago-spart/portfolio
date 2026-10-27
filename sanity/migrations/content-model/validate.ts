// Offline check of new-documents.ndjson against the rules in sanity/schemas
// (required fields, option lists, hero results, references, _keys).
//
//   node sanity/migrations/content-model/validate.ts [--remote-assets]
//
// --remote-assets also confirms every image asset id exists in the
// production dataset through the public read API (read-only GET).
// Exits 1 on any error. Nothing here writes anywhere.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOCALES, TECH_CATEGORIES } from './mapping.ts'

type Doc = { _id: string; _type: string; [field: string]: any }
export type Issue = { id: string; path: string; message: string }

const NEW_TYPES = ['tech', 'role', 'caseStudy', 'faq', 'siteSettings']
export const TIERS = ['featured', 'archive']
export const DIRECTIONS = ['up', 'down']
export const QUALIFIERS = ['atLeast', 'change']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const URL_RE = /^https?:\/\/[^\s]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IMAGE_ASSET = /^image-[0-9a-f]{40}-\d+x\d+-[a-z]+$/
const FILE_ASSET = /^file-[0-9a-f]{40}-[a-z0-9]+$/

/** All `_ref`s anywhere in a value, with their paths. */
function collectRefs(value: unknown, path: string, out: { path: string; ref: string }[] = []) {
  if (Array.isArray(value)) value.forEach((v, i) => collectRefs(v, `${path}[${i}]`, out))
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (typeof o._ref === 'string') out.push({ path, ref: o._ref })
    for (const [k, v] of Object.entries(o)) if (k !== '_ref') collectRefs(v, path ? `${path}.${k}` : k, out)
  }
  return out
}

/** Every array of objects needs a unique string `_key` on each item. */
function checkKeys(value: unknown, path: string, report: (path: string, msg: string) => void) {
  if (Array.isArray(value)) {
    const seen = new Set<string>()
    value.forEach((item, i) => {
      if (item && typeof item === 'object') {
        const key = (item as { _key?: unknown })._key
        if (typeof key !== 'string' || !key) report(`${path}[${i}]`, 'array item without _key')
        else if (seen.has(key)) report(`${path}[${i}]`, `duplicate _key "${key}"`)
        else seen.add(key)
      }
      checkKeys(item, `${path}[${i}]`, report)
    })
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) checkKeys(v, path ? `${path}.${k}` : k, report)
  }
}

export function validateDocuments(docs: Doc[], opts: { assetIds?: Set<string>; legacyIds?: Set<string> } = {}): Issue[] {
  const issues: Issue[] = []
  const byId = new Map(docs.map((d) => [d._id, d]))

  for (const doc of docs) {
    const err = (path: string, message: string) => issues.push({ id: `${doc._type}:${doc._id}`, path, message })
    const required = (path: string, v: unknown) => {
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) err(path, 'required')
    }
    const localeString = (path: string, v: any, req = true) => {
      if (v == null) return req ? err(path, 'required') : undefined
      for (const l of LOCALES) if (typeof v[l] !== 'string' || !v[l].trim()) err(`${path}.${l}`, 'required')
    }
    const localeBlock = (path: string, v: any, req = true) => {
      if (v == null) return req ? err(path, 'required') : undefined
      for (const l of LOCALES) {
        const blocks = v[l]
        if (!Array.isArray(blocks) || blocks.length === 0) { err(`${path}.${l}`, 'required'); continue }
        blocks.forEach((b: any, i: number) => {
          const p = `${path}.${l}[${i}]`
          if (b._type !== 'block') err(p, 'only blocks are allowed')
          if (b.style !== 'normal') err(p, `style "${b.style}" not allowed`)
          if (b.listItem && !['bullet', 'number'].includes(b.listItem)) err(p, `list "${b.listItem}" not allowed`)
          if (!Array.isArray(b.children) || b.children.length === 0) err(p, 'block without children')
          else if (!b.children.some((c: any) => c.text?.trim())) err(p, 'empty block')
        })
      }
    }
    const date = (path: string, v: unknown, req: boolean) => {
      if (v == null) return req ? err(path, 'required') : undefined
      if (typeof v !== 'string' || !ISO_DATE.test(v) || Number.isNaN(Date.parse(v))) err(path, `not a date: ${v}`)
    }
    const endAfterStart = () => {
      if (doc.endDate && doc.startDate && doc.endDate < doc.startDate) err('endDate', 'End date must be on or after the start date')
    }
    const url = (path: string, v: unknown) => {
      if (v != null && (typeof v !== 'string' || !URL_RE.test(v))) err(path, `not a URL: ${v}`)
    }
    const refTo = (path: string, v: any, type: string, req: boolean) => {
      if (v == null) return req ? err(path, 'required') : undefined
      const target = byId.get(v._ref)
      if (!target) err(path, `reference ${v._ref} does not resolve inside the file`)
      else if (target._type !== type) err(path, `reference points at a ${target._type}, expected ${type}`)
    }
    const stack = (v: any) => {
      if (v == null) return
      const seen = new Set<string>()
      v.forEach((r: any, i: number) => {
        refTo(`stack[${i}]`, r, 'tech', true)
        if (seen.has(r._ref)) err(`stack[${i}]`, 'duplicate tech (rule.unique)')
        seen.add(r._ref)
      })
    }
    const image = (path: string, v: any) => {
      if (v == null) return
      if (v._type !== 'imageWithAlt') err(path, `expected imageWithAlt, got ${v._type}`)
      const asset = v.asset?._ref
      if (!asset || !IMAGE_ASSET.test(asset)) err(`${path}.asset`, `not an image asset id: ${asset}`)
      else if (opts.assetIds && !opts.assetIds.has(asset)) err(`${path}.asset`, `asset ${asset} is not an existing asset`)
      localeString(`${path}.alt`, v.alt)
    }

    if (!NEW_TYPES.includes(doc._type)) err('_type', `unexpected type "${doc._type}" (old types must not be in the output)`)
    if (doc._id.startsWith('drafts.')) err('_id', 'draft id')
    if (opts.legacyIds?.has(doc._id)) err('_id', 'reuses the id of an existing document')
    checkKeys(doc, '', err)

    switch (doc._type) {
      case 'tech': {
        required('name', doc.name)
        if (!TECH_CATEGORIES.includes(doc.category)) err('category', `"${doc.category}" is not a tech category`)
        url('url', doc.url)
        const clash = docs.find((d) => d !== doc && d._type === 'tech' && String(d.name).toLowerCase() === String(doc.name).toLowerCase())
        if (clash) err('name', `"${doc.name}" already exists (case-insensitive)`)
        break
      }
      case 'role': {
        required('company', doc.company)
        url('companyUrl', doc.companyUrl)
        localeString('title', doc.title)
        date('startDate', doc.startDate, true)
        date('endDate', doc.endDate, false)
        endAfterStart()
        localeString('summary', doc.summary, false)
        stack(doc.stack)
        break
      }
      case 'caseStudy': {
        localeString('title', doc.title)
        const slug = doc.slug?.current
        if (!slug) err('slug', 'required')
        else if (docs.some((d) => d !== doc && d._type === 'caseStudy' && d.slug?.current === slug)) err('slug', `slug "${slug}" is not unique`)
        refTo('role', doc.role, 'role', false)
        if (!TIERS.includes(doc.tier)) err('tier', `"${doc.tier}" is not a tier`)
        if (doc.order != null && typeof doc.order !== 'number') err('order', 'not a number')
        localeString('summary', doc.summary, false)
        localeBlock('problem', doc.problem, false)
        localeBlock('approach', doc.approach, false)
        ;(doc.results ?? []).forEach((m: any, i: number) => {
          const p = `results[${i}]`
          if (m._type !== 'metric') err(p, `expected metric, got ${m._type}`)
          if (typeof m.after !== 'number' || Number.isNaN(m.after)) err(`${p}.after`, 'required number')
          if (m.before != null && typeof m.before !== 'number') err(`${p}.before`, 'not a number')
          if (m.unit != null && typeof m.unit !== 'string') err(`${p}.unit`, 'not a string')
          if (!DIRECTIONS.includes(m.direction)) err(`${p}.direction`, `"${m.direction}" is not up/down`)
          if (m.qualifier != null && !QUALIFIERS.includes(m.qualifier)) err(`${p}.qualifier`, `"${m.qualifier}" is not a qualifier`)
          if (m.qualifier === 'change' && m.before != null) err(`${p}.qualifier`, 'A change has no Before value')
          localeString(`${p}.label`, m.label)
        })
        stack(doc.stack)
        image('cover', doc.cover)
        ;(doc.gallery ?? []).forEach((g: any, i: number) => image(`gallery[${i}]`, g))
        if (doc.video != null && !FILE_ASSET.test(doc.video?.asset?._ref ?? '')) err('video', 'not a file asset reference')
        url('liveUrl', doc.liveUrl)
        url('githubUrl', doc.githubUrl)
        date('startDate', doc.startDate, false)
        date('endDate', doc.endDate, false)
        endAfterStart()
        if (doc.tier === 'featured') {
          if (!doc.results?.length) err('results', 'Featured case studies need at least one result')
          if (!doc.cover) err('cover', 'Featured case studies need a cover image')
        }
        break
      }
      case 'faq': {
        localeString('question', doc.question)
        localeBlock('answer', doc.answer)
        if (doc.order != null && typeof doc.order !== 'number') err('order', 'not a number')
        break
      }
      case 'siteSettings': {
        if (doc._id !== 'siteSettings') err('_id', 'the singleton must have _id "siteSettings"')
        localeString('availability', doc.availability, false)
        if (doc.email != null && !EMAIL_RE.test(doc.email)) err('email', 'not an email')
        url('linkedin', doc.linkedin)
        url('github', doc.github)
        const hero = doc.heroResults
        if (!Array.isArray(hero) || hero.length !== 3) err('heroResults', `needs exactly 3 items, has ${hero?.length ?? 0}`)
        const seen = new Set<string>()
        ;(hero ?? []).forEach((h: any, i: number) => {
          const p = `heroResults[${i}]`
          if (h._type !== 'heroResult') err(p, `expected heroResult, got ${h._type}`)
          refTo(`${p}.caseStudy`, h.caseStudy, 'caseStudy', true)
          if (!h.resultKey) { err(`${p}.resultKey`, 'Pick a result'); return }
          const cs = byId.get(h.caseStudy?._ref)
          if (cs && !cs.results?.some((r: any) => r._key === h.resultKey)) err(`${p}.resultKey`, 'This result is not in the case study')
          const id = `${h.caseStudy?._ref}:${h.resultKey}`
          if (seen.has(id)) err(p, 'The same result is picked twice')
          seen.add(id)
        })
        if (doc.seo) {
          localeString('seo.title', doc.seo.title, false)
          localeString('seo.description', doc.seo.description, false)
          image('seo.ogImage', doc.seo.ogImage)
        }
        break
      }
    }

    // Any other reference must point at a document in the file or an asset.
    for (const { path, ref } of collectRefs(doc, '')) {
      if (byId.has(ref)) continue
      if (IMAGE_ASSET.test(ref) || FILE_ASSET.test(ref)) {
        if (opts.assetIds && !opts.assetIds.has(ref)) err(path, `asset ${ref} is not an existing asset`)
        continue
      }
      err(path, `reference ${ref} does not resolve`)
    }
  }

  const singletons = docs.filter((d) => d._type === 'siteSettings')
  if (singletons.length !== 1) issues.push({ id: 'file', path: '', message: `expected 1 siteSettings, found ${singletons.length}` })
  const ids = new Set<string>()
  for (const d of docs) {
    if (ids.has(d._id)) issues.push({ id: d._id, path: '_id', message: 'duplicate _id' })
    ids.add(d._id)
  }
  return issues
}

/** Asset ids referenced by the snapshot: these exist in the dataset. */
export function assetIdsIn(snapshot: Doc[]) {
  return new Set(collectRefs(snapshot, '').map((r) => r.ref).filter((r) => IMAGE_ASSET.test(r) || FILE_ASSET.test(r)))
}

async function remoteAssetIds(ids: string[]) {
  const query = encodeURIComponent('*[_id in $ids]._id')
  const params = encodeURIComponent(JSON.stringify(ids))
  const res = await fetch(`https://wbbntp0o.apicdn.sanity.io/v2024-01-01/data/query/production?query=${query}&$ids=${params}`)
  if (!res.ok) throw new Error(`Read API returned ${res.status}`)
  return new Set<string>((await res.json()).result)
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const read = (f: string) => readFileSync(join(here, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Doc)
  const docs = read('new-documents.ndjson')
  const snapshot = read('snapshot.ndjson')
  let assetIds = assetIdsIn(snapshot)
  if (process.argv.includes('--remote-assets')) {
    const wanted = [...assetIdsIn(docs)]
    assetIds = await remoteAssetIds(wanted)
    console.log(`remote: ${assetIds.size}/${wanted.length} referenced assets exist in production`)
  }
  const issues = validateDocuments(docs, { assetIds, legacyIds: new Set(snapshot.map((d) => d._id)) })
  const counts = docs.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d._type]: (acc[d._type] ?? 0) + 1 }), {})
  console.log(`checked ${docs.length} documents: ${Object.entries(counts).map(([t, n]) => `${t} ${n}`).join(', ')}`)
  for (const i of issues) console.log(`  ✗ ${i.id} ${i.path}: ${i.message}`)
  console.log(issues.length ? `${issues.length} problem(s)` : 'no problems found')
  process.exitCode = issues.length ? 1 : 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main()
