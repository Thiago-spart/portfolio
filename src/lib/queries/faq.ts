import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'

export const FAQ_QUERY = defineQuery(`*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer
}`)

// Server function — see fetchRoles.
export const fetchFaq = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(FAQ_QUERY),
)
