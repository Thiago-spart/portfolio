import { createServerFn } from '@tanstack/react-start'
import { sanityClient } from '#/lib/sanity'
import type { SanityExperience } from '#/types/sanity'

const query = `*[_type == "experience"] | order(startDate desc) {
  _id,
  company,
  companyUrl,
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

// Server function for the same reason as fetchProjects: on client-side
// navigation to `/` the loader runs in the browser, and Sanity's CORS
// allowlist rejects browser-origin requests.
export const fetchExperiences = createServerFn({ method: 'GET' }).handler(
  (): Promise<SanityExperience[]> => sanityClient.fetch(query),
)
