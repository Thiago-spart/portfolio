import { useTranslation } from '#/i18n/useTranslation'
import ProjectCard from './ProjectCard'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDIES_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  projects: CASE_STUDIES_QUERY_RESULT
  lang: Lang
}

export default function ProjectsSection({ projects, lang }: Props) {
  const { t } = useTranslation()

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="px-6 py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="projects-heading"
          className="type-heading text-center text-ink"
        >
          {t('projects.title')}
        </h2>
        <p className="mt-3 text-center text-sm text-ink-muted">
          {t('projects.subtitle')}
        </p>

        {projects.length === 0 ? (
          <p className="mt-12 text-center text-sm text-ink-muted">
            {t('projects.empty')}
          </p>
        ) : (
          <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project._id}>
                <ProjectCard project={project} lang={lang} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
