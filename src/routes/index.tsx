import { createFileRoute, getRouteApi, rootRouteId } from '@tanstack/react-router'
import { fetchRoles }        from '#/lib/queries/roles'
import { fetchCaseStudies }  from '#/lib/queries/caseStudies'
import { fetchFaq }          from '#/lib/queries/faq'
import { fetchStack }        from '#/lib/queries/stack'
import { fetchHeroResults } from '#/lib/queries/siteSettings'
import { groupStack }        from '#/lib/stack'
import { useLanguage }       from '#/i18n/LanguageContext'
import { routeHead, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '#/lib/seo'
import HeroSection           from '#/components/HeroSection'
import TimelineSection       from '#/components/TimelineSection'
import ProjectsSection       from '#/components/ProjectsSection'
import StackSection          from '#/components/StackSection'
import HowIWorkSection       from '#/components/HowIWorkSection'
import ContactSection        from '#/components/ContactSection'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

// siteSettings is loaded once by the root route (the footer needs it too).
const rootRoute = getRouteApi(rootRouteId)

export const Route = createFileRoute('/')({
  // siteSettings.seo, when published, overrides the copy in code (and the
  // root route's og:image); otherwise the constants above stay in place.
  head: ({ matches }) => {
    const root = matches.find((m) => (m.routeId as string) === rootRouteId)
    const seo  = (root?.loaderData as SITE_SETTINGS_QUERY_RESULT | undefined)?.seo
    const head = routeHead({
      title: seo?.title?.en ?? DEFAULT_TITLE,
      description: seo?.description?.en ?? DEFAULT_DESCRIPTION,
      path: '/',
    })
    const og = seo?.ogImage
    if (!og?.url) return head
    return {
      ...head,
      meta: [
        ...head.meta,
        { property: 'og:image', content: og.url },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:alt', content: og.alt.en },
        { name: 'twitter:image', content: og.url },
        { name: 'twitter:image:alt', content: og.alt.en },
      ],
    }
  },
  loader: async () => {
    const [roles, caseStudies, faq, stack, heroResults] = await Promise.all([
      fetchRoles(),
      fetchCaseStudies(),
      fetchFaq(),
      fetchStack(),
      // The hero still works without its results lane if this fails.
      fetchHeroResults().catch(() => null),
    ])
    return {
      roles,
      caseStudies,
      faq,
      stack: { groups: groupStack(stack.techs), caseStudyCount: stack.caseStudyCount },
      heroResults,
    }
  },
  component: HomePage,
})

function HomePage() {
  const { roles, caseStudies, faq, stack, heroResults } = Route.useLoaderData()
  const settings = rootRoute.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <HeroSection results={heroResults} />
      <ProjectsSection projects={caseStudies} lang={lang} />
      <TimelineSection roles={roles} lang={lang} />
      <StackSection groups={stack.groups} caseStudyCount={stack.caseStudyCount} lang={lang} />
      <HowIWorkSection items={faq} lang={lang} />
      <ContactSection settings={settings} />
    </main>
  )
}
