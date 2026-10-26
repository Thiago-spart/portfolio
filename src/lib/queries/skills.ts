import { createServerFn } from '@tanstack/react-start'
import { sanityClient } from '#/lib/sanity'
import type { SanitySkillCategory } from '#/types/sanity'

const query = `*[_type == "skillCategory"] | order(order asc) {
  _id,
  category,
  skills[] { name, icon },
  order
}`

// Server function — see fetchExperiences.
export const fetchSkills = createServerFn({ method: 'GET' }).handler(
  (): Promise<SanitySkillCategory[]> => sanityClient.fetch(query),
)
