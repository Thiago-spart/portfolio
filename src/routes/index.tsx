import { createFileRoute, getRouteApi, rootRouteId } from '@tanstack/react-router'
import { fetchRoles }        from '#/lib/queries/roles'
import { fetchCaseStudies }  from '#/lib/queries/caseStudies'
import { fetchFaq }          from '#/lib/queries/faq'
import { fetchStack }        from '#/lib/queries/stack'
import { fetchHeroResults } from '#/lib/queries/siteSettings'
import { filterByTech, findTech, groupStack, techSearch, techSlug } from '#/lib/stack'
import { revealSection }     from '#/lib/inPage'
import { useLanguage }       from '#/i18n/LanguageContext'
import { routeHead, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '#/lib/seo'
import HeroSection           from '#/components/HeroSection'
import TimelineSection       from '#/components/TimelineSection'
import ProjectsSection       from '#/components/ProjectsSection'
import StackSection          from '#/components/StackSection'
import HowIWorkSection       from '#/components/HowIWorkSection'
import ContactSection        from '#/components/ContactSection'
import SheetIndex, { type SheetStats } from '#/components/SheetIndex'
import type { SITE_SETTINGS_QUERY_RESULT } from '#/types/sanity.generated'

// siteSettings is loaded once by the root route (the footer needs it too).
const rootRoute = getRouteApi(rootRouteId)

export const Route = createFileRoute('/')({
  // The Stack filter: ?tech=react-native selects a tech, shareable and
  // kept across a reload.
  validateSearch: techSearch,
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
      stack: { groups: groupStack(stack.techs) },
      heroResults,
    }
  },
  component: HomePage,
})

function HomePage() {
  const { roles, caseStudies, faq, stack, heroResults } = Route.useLoaderData()
  const settings = rootRoute.useLoaderData()
  const { lang } = useLanguage()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  // The Stack filter. Selecting a tech dims the case studies that don't use
  // it and marks the roles behind the ones that do (filterByTech);
  // selecting it again clears. Work comes into view unless it's on screen.
  const tech = findTech(stack.groups, search.tech)
  const { using, marked } = filterByTech(caseStudies, tech)
  const selectTech = (name: string) => {
    const next = name === tech ? undefined : techSlug(name)
    void navigate({ search: (prev) => ({ ...prev, tech: next }), replace: true, resetScroll: false })
    if (next) revealSection('projects')
  }

  // The sheet index's previews, counted from what the sections show.
  const years = roles.map((role) => Number(role.startDate.slice(0, 4)))
  const stats: SheetStats = {
    caseStudies: caseStudies.length,
    best: caseStudies[0]?.results?.[0] ?? null,
    roles: roles.length,
    since: years.length > 0 ? Math.min(...years) : null,
    techs: stack.groups.reduce((sum, group) => sum + group.techs.length, 0),
    questions: faq.length,
  }

  return (
    <>
      {/* Navigation, so outside main: the skip link lands past it. */}
      <SheetIndex stats={stats} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <HeroSection results={heroResults} />
        <ProjectsSection projects={caseStudies} lang={lang} tech={tech} />
        <TimelineSection roles={roles} lang={lang} marked={marked} />
        <StackSection
          groups={stack.groups}
          lang={lang}
          selected={tech}
          matches={using.length}
          onSelect={selectTech}
        />
        <HowIWorkSection items={faq} lang={lang} />
        <ContactSection settings={settings} />
      </main>
    </>
  )
}
