import { ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { formatDateRange } from '#/lib/formatDate'
import MetricTile from './MetricTile'
import RichText from './RichText'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDY_DETAIL_QUERY_RESULT } from '#/types/sanity.generated'

interface ProjectDetailsProps {
  project: NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>
  lang: Lang
}

export default function ProjectDetails({ project, lang }: ProjectDetailsProps) {
  const { t } = useTranslation()
  const dates   = formatDateRange(project.startDate, project.endDate, t('timeline.present'))
  const role    = project.role ? `${project.role.title[lang]} · ${project.role.company}` : null
  const results = project.results ?? []
  const stack   = project.stack ?? []
  const gallery = (project.gallery ?? []).filter((image) => image.url)

  return (
    <div className="mx-auto max-w-3xl text-left">
      {/* Problem, then approach: prose, no headings until the redesign adds them */}
      <RichText value={project.problem?.[lang]} className="text-sm text-ink-muted" />
      <RichText value={project.approach?.[lang]} className="mt-4 text-sm text-ink-muted" />

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display text-2xl tracking-wide text-ink">
            {t('project.highlights')}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((result) => (
              <MetricTile key={result._key} metric={result} label={result.label[lang]} />
            ))}
          </div>
        </div>
      )}

      {(role || dates) && (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-mangrove uppercase">
          {role && <span>{role}</span>}
          {role && dates && <span aria-hidden="true">•</span>}
          {dates && <span>{dates}</span>}
        </div>
      )}

      {stack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink no-underline"
            >
              <ExternalLink size={16} aria-hidden="true" />
              {t('project.liveUrl')}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink no-underline"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17v3.21c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
              {t('project.sourceCode')}
            </a>
          )}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-2xl tracking-wide text-ink">
            {t('project.gallery')}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <img key={image._key} src={image.url ?? undefined} alt={image.alt[lang]} className="w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
