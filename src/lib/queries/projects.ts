import { createServerFn } from '@tanstack/react-start'
import { sanityClient } from '#/lib/sanity'
import type { SanityProject } from '#/types/sanity'

// Sanity's asset CDN accepts image transform params directly on the asset
// URL (no @sanity/image-url needed) — cover.asset->url alone serves the
// original upload at full resolution, which was routinely 3-4MB per image
// here for a 288px-tall card thumbnail.
const query = `*[_type == "project"] | order(startDate desc) {
  _id,
  title,
  slug,
  shortDescription,
  "coverImageUrl": coverImage.asset->url + "?w=700&h=500&fit=crop&auto=format&q=75",
  techStack,
  category,
  status,
  featured
}`

// Sanity's CORS allowlist rejects browser-origin requests, so this must run
// as a server function — otherwise a client-side (preloaded) route
// navigation calls it from the browser and the fetch fails.
export const fetchProjects = createServerFn({ method: 'GET' }).handler(
  (): Promise<SanityProject[]> => sanityClient.fetch(query),
)

const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  highlights,
  challenges,
  "coverImageUrl": coverImage.asset->url + "?w=1600&auto=format&q=75",
  "videoUrl": video.asset->url,
  "galleryUrls": gallery[]{ "url": asset->url + "?w=1000&auto=format&q=75" }.url,
  techStack,
  category,
  liveUrl,
  githubUrl,
  startDate,
  endDate,
  status,
  featured
}`

export const fetchProjectBySlug = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }): Promise<SanityProject | null> =>
    sanityClient.fetch(detailQuery, { slug }),
  )
