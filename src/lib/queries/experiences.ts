import { sanityClient } from '#/lib/sanity'
import type { SanityExperience } from '#/types/sanity'

const query = `*[_type == "experience"] | order(startDate desc) {
  _id,
  company,
  companyUrl,
  "companyLogoUrl": companyLogo.asset->url,
  role,
  description,
  startDate,
  endDate,
  techStack,
  highlights[] {
    value,
    label
  }
}`

export function fetchExperiences(): Promise<SanityExperience[]> {
  return sanityClient.fetch(query)
}
