import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchCaseStudyBySlug } from '#/lib/queries/caseStudies'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { DEFAULT_DESCRIPTION, routeHead } from '#/lib/seo'
import { formatDateRange } from '#/lib/formatDate'
import ProjectHero from '#/components/ProjectHero'
import ProjectDetails from '#/components/ProjectDetails'

const EARTH_LOOP_SRC = '/media/earth-loop.mp4'

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const project = await fetchCaseStudyBySlug({ data: params.slug })
    if (!project) throw notFound()
    return { project }
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
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-3xl text-ink">Project not found</p>
      <a href="/#projects" className="text-sm font-semibold text-mangrove">
        ← Back to projects
      </a>
    </main>
  )
}

function ProjectPage() {
  const { project } = Route.useLoaderData()
  const { lang } = useLanguage()
  const { t } = useTranslation()

  return (
    <main>
      <ProjectHero
        videoSrc={project.videoUrl ?? undefined}
        posterSrc={project.cover?.url ?? undefined}
        bgImageSrc={project.cover?.url ?? undefined}
        imageAlt={project.cover?.alt[lang]}
        ambientVideoSrc={EARTH_LOOP_SRC}
        title={project.title[lang]}
        date={formatDateRange(project.startDate, project.endDate, t('timeline.present'))}
        scrollToExpand={t('project.scrollHint')}
      >
        <ProjectDetails project={project} lang={lang} />
      </ProjectHero>
      <div className="px-6 pb-16 text-center">
        <a href="/#projects" className="text-sm font-semibold text-mangrove">
          ← {t('project.back')}
        </a>
      </div>
    </main>
  )
}
