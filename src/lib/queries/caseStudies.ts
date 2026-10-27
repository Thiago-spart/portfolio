import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'
import { METRIC_FIELDS }  from '#/lib/queryFragments'

// Sanity's asset CDN accepts image transform params directly on the asset
// URL (no @sanity/image-url needed) — cover.asset->url alone serves the
// original upload at full resolution, which was routinely 3-4MB per image
// here for a 288px-tall card thumbnail.
//
// Featured case studies first (by `order`), then the archive, newest first.
export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)]
  | order(tier desc, order asc, startDate desc) {
  _id,
  title,
  "slug": slug.current,
  tier,
  summary,
  "cover": cover{
    "url": asset->url + "?w=700&h=500&fit=crop&auto=format&q=75",
    alt
  },
  "stack": stack[]->name,
  "headlineResult": results[0]{ ${METRIC_FIELDS} }
}`)

// Sanity's CORS allowlist rejects browser-origin requests, so this must run
// as a server function — otherwise a client-side (preloaded) route
// navigation calls it from the browser and the fetch fails.
export const fetchCaseStudies = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(CASE_STUDIES_QUERY),
)

export const CASE_STUDY_DETAIL_QUERY = defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  problem,
  approach,
  "results": results[]{ ${METRIC_FIELDS} },
  "stack": stack[]->name,
  "role": role->{ company, companyUrl, title },
  "cover": cover{
    "url": asset->url + "?w=1600&auto=format&q=75",
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
