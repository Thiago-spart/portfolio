import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'
import { METRIC_FIELDS }  from '#/lib/queryFragments'

// Featured case studies first (by `order`), then the archive, newest first.
// One row feeds both the Case card (featured) and the Archive row: the role
// title and dates for the card head, the stack names, the first two
// results (the first is the archive row's headline result) and the live
// URL the card links to. This order is
// also the reading order behind "Next case study".
export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)]
  | order(tier desc, order asc, startDate desc) {
  _id,
  title,
  "slug": slug.current,
  tier,
  summary,
  "roleTitle": role->title,
  startDate,
  endDate,
  "stack": stack[]->name,
  "results": results[0...2]{ ${METRIC_FIELDS} },
  liveUrl
}`)

// Sanity's CORS allowlist rejects browser-origin requests, so this must run
// as a server function — otherwise a client-side (preloaded) route
// navigation calls it from the browser and the fetch fails.
export const fetchCaseStudies = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(CASE_STUDIES_QUERY),
)

// Sanity's asset CDN accepts image transform params directly on the asset
// URL (no @sanity/image-url needed); asset->url alone serves the original
// upload at full resolution (routinely 3-4MB here). The cover is cropped to
// the 2:1 frame it is drawn in, at 2x the 1120px column.
export const CASE_STUDY_DETAIL_QUERY = defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  problem,
  decision,
  approach,
  "results": results[]{ ${METRIC_FIELDS} },
  // The tools, not the practices (SEO, BFF, i18n…): the story carries those.
  "stack": stack[@->category != "practice"]->name,
  "role": role->{ company, companyUrl, title },
  "cover": cover{
    "url": asset->url + "?w=2240&h=1120&fit=crop&auto=format&q=75",
    alt
  },
  "gallery": gallery[]{
    _key,
    "url": asset->url + "?w=1000&auto=format&q=75",
    alt
  },
  "videoUrl": video.asset->url,
  liveUrl,
  githubUrl,
  startDate,
  endDate
}`)

export const fetchCaseStudyBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => sanityClient.fetch(CASE_STUDY_DETAIL_QUERY, { slug }))
