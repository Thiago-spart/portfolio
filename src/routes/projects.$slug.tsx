import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchProjectBySlug } from '#/lib/queries/projects'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { routeHead } from '#/lib/seo'
import { formatProjectDate } from '#/lib/formatDate'
import ProjectHero from '#/components/ProjectHero'
import ProjectDetails from '#/components/ProjectDetails'

const EARTH_LOOP_SRC = '/media/earth-loop.mp4'

function formatHeroDate(startDate: string, endDate: string | null, presentLabel: string): string {
  const end = endDate ? formatProjectDate(endDate) : presentLabel
  return `${formatProjectDate(startDate)} — ${end}`
}

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const project = await fetchProjectBySlug(params.slug)
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
          description: loaderData.project.shortDescription.en,
          path: `/projects/${loaderData.project.slug.current}`,
        })
      : { meta: [{ title: 'Project not found — Thiago Souza' }] },
  notFoundComponent: ProjectNotFound,
  component: ProjectPage,
})

function ProjectNotFound() {
  return (
    <main className="cyberpunk-surface flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-['Bebas_Neue'] text-3xl tracking-wider text-white">Project not found</p>
      <a href="/#projects" className="text-sm font-semibold text-[var(--electric-blue,#00aaff)]">
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
        videoSrc={project.videoUrl}
        posterSrc={project.coverImageUrl}
        bgImageSrc={project.coverImageUrl}
        ambientVideoSrc={EARTH_LOOP_SRC}
        title={project.title[lang]}
        date={formatHeroDate(project.startDate, project.endDate, t('timeline.present'))}
        scrollToExpand={t('project.scrollHint')}
      >
        <ProjectDetails project={project} lang={lang} />
      </ProjectHero>
      <div className="px-6 pb-16 text-center">
        <a href="/#projects" className="text-sm font-semibold text-[var(--electric-blue,#00aaff)]">
          ← {t('project.back')}
        </a>
      </div>
    </main>
  )
}
