import { createServerFn } from '@tanstack/react-start'
import { sanityClient } from '#/lib/sanity'
import type { SanityQA } from '#/types/sanity'

const query = `*[_type == "qa"] | order(order asc) {
  _id,
  question,
  answer,
  order
}`

// Server function — see fetchExperiences.
export const fetchQA = createServerFn({ method: 'GET' }).handler(
  (): Promise<SanityQA[]> => sanityClient.fetch(query),
)
