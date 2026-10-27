import { createFileRoute } from '@tanstack/react-router'
import { fetchRoles }        from '#/lib/queries/roles'
import { fetchCaseStudies }  from '#/lib/queries/caseStudies'
import { fetchFaq }          from '#/lib/queries/faq'
import { fetchStack }        from '#/lib/queries/stack'
import { fetchSiteSettings } from '#/lib/queries/siteSettings'
import { groupStack }        from '#/lib/stack'
import { useLanguage }       from '#/i18n/LanguageContext'
import { routeHead, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '#/lib/seo'
import HeroSection           from '#/components/HeroSection'
import TimelineSection       from '#/components/TimelineSection'
import ProjectsSection       from '#/components/ProjectsSection'
import SkillsSection         from '#/components/SkillsSection'
import QASection             from '#/components/QASection'
import ContactSection        from '#/components/ContactSection'

export const Route = createFileRoute('/')({
  // siteSettings.seo, when published, overrides the copy in code (and the
  // root route's og:image); otherwise the constants above stay in place.
  head: ({ loaderData }) => {
    const seo  = loaderData?.settings?.seo
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
    const [roles, caseStudies, faq, stack, settings] = await Promise.all([
      fetchRoles(),
      fetchCaseStudies(),
      fetchFaq(),
      fetchStack(),
      fetchSiteSettings(),
    ])
    return { roles, caseStudies, faq, stack: groupStack(stack), settings }
  },
  component: HomePage,
})

function HomePage() {
  const { roles, caseStudies, faq, stack, settings } = Route.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <HeroSection />
      <TimelineSection roles={roles} lang={lang} />
      <ProjectsSection projects={caseStudies} lang={lang} />
      <SkillsSection groups={stack} lang={lang} />
      <QASection items={faq} lang={lang} />
      <ContactSection settings={settings} />
    </main>
  )
}
