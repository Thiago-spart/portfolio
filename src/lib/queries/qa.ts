import { sanityClient } from '#/lib/sanity'
import type { SanityQA } from '#/types/sanity'

const query = `*[_type == "qa"] | order(order asc) {
  _id,
  question,
  answer,
  order
}`

export function fetchQA(): Promise<SanityQA[]> {
  return sanityClient.fetch(query)
}
