import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'

// The Stack section only lists techs a case study or role actually uses,
// each with how many case studies reference it; `caseStudyCount` is the
// total the lede quotes ("how many of the 13 case studies use it"). Both
// counts skip case studies without a slug, which the site never links.
// Grouping and sorting happen in groupStack (src/lib/stack.ts).
export const STACK_QUERY = defineQuery(`{
  "caseStudyCount": count(*[_type == "caseStudy" && defined(slug.current)]),
  "techs": *[_type == "tech" && count(*[_type in ["caseStudy", "role"] && references(^._id)]) > 0]
    | order(name asc) {
    _id,
    name,
    category,
    "caseStudies": count(*[_type == "caseStudy" && defined(slug.current) && references(^._id)])
  }
}`)

// Server function — see fetchRoles.
export const fetchStack = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(STACK_QUERY),
)
