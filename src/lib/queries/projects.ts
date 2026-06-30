import { sanityClient } from '#/lib/sanity'
import type { SanityProject } from '#/types/sanity'

const query = `*[_type == "project"] | order(startDate desc) {
  _id,
  title,
  slug,
  shortDescription,
  "coverImageUrl": coverImage.asset->url,
  techStack,
  category,
  status,
  featured
}`

export function fetchProjects(): Promise<SanityProject[]> {
  return sanityClient.fetch(query)
}
