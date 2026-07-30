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

const detailQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  highlights,
  challenges,
  "coverImageUrl": coverImage.asset->url,
  "videoUrl": video.asset->url,
  "galleryUrls": gallery[].asset->url,
  techStack,
  category,
  liveUrl,
  githubUrl,
  startDate,
  endDate,
  status,
  featured
}`

export function fetchProjectBySlug(slug: string): Promise<SanityProject | null> {
  return sanityClient.fetch(detailQuery, { slug })
}
