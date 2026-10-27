import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchCaseStudies, fetchCaseStudyBySlug } from '#/lib/queries/caseStudies'
import { nextCaseStudy } from '#/lib/caseStudy'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { DEFAULT_DESCRIPTION, routeHead } from '#/lib/seo'
import CaseStudyPage from '#/components/CaseStudyPage'
import { Button } from '#/components/ui/Button'

export const Route = createFileRoute('/projects/$slug')({
  // The list query is the reading order (featured, then archive); only the
  // next row goes into the loader data.
  loader: async ({ params }) => {
    const [project, all] = await Promise.all([
      fetchCaseStudyBySlug({ data: params.slug }),
      fetchCaseStudies(),
    ])
    if (!project) throw notFound()
    return { project, next: nextCaseStudy(all, project.slug) }
  },
  // head() still runs for this match when the loader throws notFound(), with
  // loaderData === undefined — dereferencing it there throws a TypeError that
  // the router swallows, dropping every meta tag on the page.
  head: ({ loaderData }) =>
    loaderData
      ? routeHead({
          title: `${loaderData.project.title.en} — Thiago Souza`,
          description: loaderData.project.summary?.en ?? DEFAULT_DESCRIPTION,
          path: `/projects/${loaderData.project.slug}`,
        })
      : { meta: [{ title: 'Project not found — Thiago Souza' }] },
  notFoundComponent: ProjectNotFound,
  component: ProjectPage,
})

function ProjectNotFound() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="m-0 type-heading text-ink">{t('caseStudy.notFound')}</p>
      <Button variant="ghost" size="small" href="/#projects">
        {t('caseStudy.back')}
      </Button>
    </main>
  )
}

function ProjectPage() {
  const { project, next } = Route.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <CaseStudyPage caseStudy={project} next={next} lang={lang} />
    </main>
  )
}
