import { createServerFn } from '@tanstack/react-start'
import { defineQuery }    from 'groq'
import { sanityClient }   from '#/lib/sanity'
import { METRIC_FIELDS }  from '#/lib/queryFragments'

// Singleton at a fixed id (see sanity/structure.ts). Contact links and SEO
// defaults; src/lib/seo.ts keeps the fallbacks for when it isn't published.
export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  email,
  linkedin,
  github,
  "seo": seo{
    title,
    description,
    "ogImage": ogImage{
      "url": asset->url + "?w=1200&h=630&fit=crop&fm=jpg&q=80",
      alt
    }
  }
}`)

// Server function — see fetchRoles.
export const fetchSiteSettings = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(SITE_SETTINGS_QUERY),
)

// The three hero results, each resolved to the metric it points at inside
// its case study (heroResult stores that metric's _key). Not rendered yet:
// the hero redesign (Figma "Result label" lane) will consume it.
export const HERO_RESULTS_QUERY = defineQuery(`*[_id == "siteSettings"][0].heroResults[]{
  _key,
  "caseStudy": caseStudy->{ title, "slug": slug.current },
  "result": caseStudy->results[_key == ^.resultKey][0]{ ${METRIC_FIELDS} }
}`)

/** @public No caller until the hero redesign; kept typed and tested meanwhile. */
export const fetchHeroResults = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch(HERO_RESULTS_QUERY),
)
