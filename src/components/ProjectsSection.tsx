import { useTranslation } from '#/i18n/useTranslation'
import { ArchiveRow } from './ArchiveRow'
import { CaseCard } from './CaseCard'
import { Section } from './ui/Section'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDIES_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  projects: CASE_STUDIES_QUERY_RESULT
  lang: Lang
}

// Figma: Sections / Work (30:21, 30:248, 30:475). The featured case studies
// as Case cards, two columns from 768px, then "More work": the archive as
// Archive rows, newest first. The query already returns that order.
export default function ProjectsSection({ projects, lang }: Props) {
  const { t } = useTranslation()
  const featured = projects.filter((p) => p.tier === 'featured')
  const archive = projects.filter((p) => p.tier === 'archive')

  return (
    <Section id="projects" heading={t('work.title')} lede={t('work.lede')}>
      {projects.length === 0 && <p className="m-0 type-body text-ink-muted">{t('work.empty')}</p>}

      {featured.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {featured.map((caseStudy, i) => (
            <li key={caseStudy._id}>
              <CaseCard caseStudy={caseStudy} lang={lang} accent={i === 0} />
            </li>
          ))}
        </ul>
      )}

      {archive.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 md:mt-12">
          <div className="flex flex-col gap-2">
            <h3 id="more-work-heading" className="m-0 type-title text-ink">
              {t('work.more.title')}
            </h3>
            <p className="m-0 type-small text-ink-muted">
              {archive.length === 1
                ? t('work.more.ledeOne')
                : t('work.more.lede').replace('{count}', String(archive.length))}
            </p>
          </div>
          <ul aria-labelledby="more-work-heading" className="m-0 list-none p-0">
            {archive.map((caseStudy) => (
              <li key={caseStudy._id}>
                <ArchiveRow caseStudy={caseStudy} lang={lang} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
