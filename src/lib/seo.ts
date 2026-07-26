// Single source of truth for site-wide SEO values. Update SITE_URL here
// (and in public/robots.txt + public/sitemap.xml) once a real domain exists.
export const SITE_URL = 'https://thiagosouza.dev'
export const SITE_NAME = 'Thiago Souza'
export const AUTHOR_NAME = 'Thiago Moraes de Souza'
export const AUTHOR_EMAIL = 'thiagomoraes.contact@gmail.com'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/thiago-moraes-souza/'
export const OG_IMAGE_PATH = '/og-image.png'

export const DEFAULT_TITLE = 'Thiago Souza — Full-Stack Developer'
export const DEFAULT_DESCRIPTION =
  "Portfolio of Thiago Souza, a full-stack developer building fast, thoughtful web experiences. Explore projects, experience, and skills."

interface RouteSeoOptions {
  title: string
  description: string
  path: string
}

/**
 * Per-route head() meta. Root supplies the shared og:image/type/site_name
 * defaults, so routes only need to override the title/description/url triad
 * (meta name/property tags dedupe leaf-over-root; canonical links don't, so
 * only leaf routes should ever add one).
 */
export function routeHead({ title, description, path }: RouteSeoOptions) {
  const url = `${SITE_URL}${path}`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
