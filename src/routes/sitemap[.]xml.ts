import { createFileRoute } from '@tanstack/react-router'
import { sanityClient } from '#/lib/sanity'
import { SITE_URL } from '#/lib/seo'

interface SitemapProject {
  slug: string
  updatedAt: string
}

const projectsQuery = `*[_type == "project"]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`

function urlEntry(loc: string, lastmod: string | undefined, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      // Generated at request time (not a static public/ file) so newly
      // published Sanity projects show up without a redeploy.
      GET: async () => {
        const projects = await sanityClient.fetch<SitemapProject[]>(projectsQuery)

        const entries = [
          urlEntry(`${SITE_URL}/`, undefined, 'monthly', '1.0'),
          ...projects.map((project) =>
            urlEntry(
              `${SITE_URL}/projects/${project.slug}`,
              project.updatedAt.slice(0, 10),
              'monthly',
              '0.8',
            ),
          ),
        ]

        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

        return new Response(body, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
