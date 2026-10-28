import { AUTHOR_EMAIL, LINKEDIN_URL } from './seo'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

export interface ContactLinks {
  email: string
  linkedin: string
  github: string | null
}

// Contact links come from siteSettings. Until that singleton is published,
// email and LinkedIn fall back to src/lib/seo.ts so no contact block ever
// empties; GitHub only shows once it's set. Shared by the Contact section
// and the footer.
export function contactLinks(settings: SITE_SETTINGS_QUERY_RESULT | undefined): ContactLinks {
  return {
    email: settings?.email ?? AUTHOR_EMAIL,
    linkedin: settings?.linkedin ?? LINKEDIN_URL,
    github: settings?.github ?? null,
  }
}
