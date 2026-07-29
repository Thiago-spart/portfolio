import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchProjectBySlug } from '#/lib/queries/projects'
import { useLanguage } from '#/i18n/LanguageContext'
import { useTranslation } from '#/i18n/useTranslation'
import { routeHead } from '#/lib/seo'
import ProjectHero from '#/components/ProjectHero'
import ProjectDetails from '#/components/ProjectDetails'

function formatHeroDate(startDate: string, endDate: string | null, presentLabel: string): string {
  const format = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', year: 'numeric' })
  return `${format(startDate)} — ${endDate ? format(endDate) : presentLabel}`
}

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const project = await fetchProjectBySlug(params.slug)
    if (!project) throw notFound()
    return { project }
  },
  head: ({ loaderData }) =>
    routeHead({
      title: `${loaderData!.project.title.en} — Thiago Souza`,
      description: loaderData!.project.shortDescription.en,
      path: `/projects/${loaderData!.project.slug.current}`,
    }),
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
        bgImageSrc={project.coverImageUrl ?? ''}
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
