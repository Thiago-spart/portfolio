import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'

export const FAQ_QUERY = defineQuery(`*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer,
  // "See it in": the case studies behind the answer that are published.
  "caseStudies": caseStudies[defined(@->slug.current)]->{ _id, title, "slug": slug.current }
}`)

// Server function — see fetchRoles.
export const fetchFaq = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(FAQ_QUERY),
)
