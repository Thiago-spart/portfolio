import { sanityClient } from '#/lib/sanity'
import type { SanitySkillCategory } from '#/types/sanity'

const query = `*[_type == "skillCategory"] | order(order asc) {
  _id,
  category,
  skills[] { name, icon },
  order
}`

export function fetchSkills(): Promise<SanitySkillCategory[]> {
  return sanityClient.fetch(query)
}
