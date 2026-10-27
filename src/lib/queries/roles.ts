import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'
import { METRIC_FIELDS }  from '#/lib/queryFragments'

// Timeline, newest role first. Case studies point at their role, so they're
// found by reverse lookup; their results replace the old role highlights.
export const ROLES_QUERY = defineQuery(`*[_type == "role"] | order(startDate desc) {
  _id,
  company,
  companyUrl,
  title,
  summary,
  startDate,
  endDate,
  "stack": stack[]->name,
  "caseStudies": *[_type == "caseStudy" && references(^._id) && defined(slug.current)]
    | order(tier desc, order asc, startDate desc) {
    _id,
    title,
    "slug": slug.current,
    "results": results[]{ ${METRIC_FIELDS} }
  }
}`)

// Server function for the same reason as fetchCaseStudies: on client-side
// navigation to `/` the loader runs in the browser, and Sanity's CORS
// allowlist rejects browser-origin requests.
export const fetchRoles = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(ROLES_QUERY),
)
