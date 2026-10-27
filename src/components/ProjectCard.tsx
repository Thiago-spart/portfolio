import { Link } from '@tanstack/react-router'
import { formatMetric } from '#/lib/metric'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDIES_QUERY_RESULT } from '#/types/sanity.generated'

interface ProjectCardProps {
  project: CASE_STUDIES_QUERY_RESULT[number]
  lang: Lang
}

export default function ProjectCard({ project, lang }: ProjectCardProps) {
  const coverUrl = project.cover?.url
  const hasImage = Boolean(coverUrl)
  const result   = project.headlineResult

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group relative block h-72 w-full overflow-hidden rounded-md border border-line bg-surface-raised"
    >
      {hasImage ? (
        <div
          data-testid="project-card-image"
          role="img"
          aria-label={project.cover?.alt[lang]}
          className="absolute inset-0 saturate-0 transition-all duration-500 group-hover:scale-110 group-hover:saturate-100"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <div data-testid="project-card-fallback" className="absolute inset-0" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ground via-transparent to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5">
        <h3 className="font-display text-2xl tracking-wide text-ink transition-colors group-hover:text-mangrove">
          {project.title[lang]}
        </h3>
        {project.summary?.[lang] && (
          <p className="line-clamp-3 text-sm text-ink-muted">
            {project.summary[lang]}
          </p>
        )}
        {result && (
          <p data-direction={result.direction} className="text-xs font-semibold text-mangrove">
            {formatMetric(result)} · {result.label[lang]}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {(project.stack ?? []).slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
