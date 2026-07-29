import { ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import type { Lang, SanityProject } from '#/types/sanity'

interface ProjectDetailsProps {
  project: SanityProject
  lang: Lang
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

export default function ProjectDetails({ project, lang }: ProjectDetailsProps) {
  const { t } = useTranslation()
  const endLabel = project.endDate ? formatDate(project.endDate) : t('timeline.present')

  return (
    <div className="mx-auto max-w-3xl text-left">
      <p className="text-sm text-[rgba(255,255,255,0.75)]">{project.longDescription[lang]}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-widest text-[var(--electric-blue,#00aaff)] uppercase">
        <span>{t(`project.status.${project.status}`)}</span>
        <span aria-hidden="true">•</span>
        <span>
          {formatDate(project.startDate)} — {endLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#00aaff] px-4 py-2 text-sm font-semibold text-[#c8f0ff] no-underline"
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
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.3)] px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17v3.21c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
              {t('project.sourceCode')}
            </a>
          )}
        </div>
      )}

      {project.galleryUrls && project.galleryUrls.length > 0 && (
        <div className="mt-10">
          <h3 className="font-['Bebas_Neue'] text-2xl tracking-wide text-white">
            {t('project.gallery')}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.galleryUrls.map((url, index) => (
              <img key={url} src={url} alt={`${project.title[lang]} screenshot ${index + 1}`} className="w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
