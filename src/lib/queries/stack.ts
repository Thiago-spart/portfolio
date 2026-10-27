import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'

// The Stack section only lists techs a case study or role actually uses;
// grouping by category happens in groupStack (src/lib/stack.ts).
export const STACK_QUERY = defineQuery(`*[_type == "tech" && count(*[_type in ["caseStudy", "role"] && references(^._id)]) > 0]
  | order(name asc) {
  _id,
  name,
  category
}`)

// Server function — see fetchRoles.
export const fetchStack = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(STACK_QUERY),
)
