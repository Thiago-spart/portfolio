import type { ReactNode } from 'react'
import { Code, ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { formatMonthRange, isCoreTech, type CaseStudyRow } from '#/lib/caseStudy'
import { ArchiveRow } from './ArchiveRow'
import RichText from './RichText'
import { Button } from './ui/Button'
import { Callout } from './ui/Callout'
import { Container } from './ui/Section'
import { Metric } from './ui/Metric'
import { Tag } from './ui/Tag'
import type { Lang } from '#/i18n/LanguageContext'
import type { CASE_STUDY_DETAIL_QUERY_RESULT } from '#/types/sanity.generated'

interface CaseStudyPageProps {
  caseStudy: NonNullable<CASE_STUDY_DETAIL_QUERY_RESULT>
  // The case study after this one in reading order; null when it's the only one.
  next: CaseStudyRow | null
  lang: Lang
}

// Portable Text from the Studio: the opening paragraph in ink, lists muted,
// space-4 between blocks, bullets indented space-6 as drawn.
const PROSE =
  'type-body text-ink [&>*+*]:mt-4! [&_ol]:pl-6 [&_ol]:text-ink-muted [&_ul]:pl-6 [&_ul]:text-ink-muted'

// Figma: Sections / Case study (32:573, 32:699, 32:823). Intro (back link,
// meta, title, summary, live site), results strip, cover, numbered parts
// (problem, approach, stack, then gallery and video when present), and the
// next case study.
export default function CaseStudyPage({ caseStudy, next, lang }: CaseStudyPageProps) {
  const { t } = useTranslation()
  const dates = formatMonthRange(caseStudy.startDate, caseStudy.endDate, t('work.present'), lang)
  const role = caseStudy.role ? `${caseStudy.role.title[lang]} · ${caseStudy.role.company}` : null
  const summary = caseStudy.summary?.[lang]
  const results = caseStudy.results ?? []
  const stack = caseStudy.stack ?? []
  const gallery = (caseStudy.gallery ?? []).filter((image) => image.url)
  const problem = caseStudy.problem?.[lang]
  const approach = caseStudy.approach?.[lang]

  // Parts are numbered in the order they appear, skipping empty ones.
  const parts: Array<{ id: string; label: string; content: ReactNode }> = []
  if (problem?.length) {
    parts.push({ id: 'problem', label: t('caseStudy.problem'), content: <RichText value={problem} className={PROSE} /> })
  }
  if (approach?.length) {
    parts.push({ id: 'approach', label: t('caseStudy.approach'), content: <RichText value={approach} className={PROSE} /> })
  }
  if (stack.length > 0) {
    parts.push({
      id: 'stack',
      label: t('caseStudy.stack'),
      content: (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {stack.map((tech) => (
            <li key={tech}>
              <Tag label={tech} core={isCoreTech(tech)} />
            </li>
          ))}
        </ul>
      ),
    })
  }
  if (gallery.length > 0 || caseStudy.videoUrl) {
    parts.push({
      id: 'gallery',
      label: t('caseStudy.gallery'),
      content: (
        <div className="flex flex-col gap-4">
          {caseStudy.videoUrl && (
            <video
              src={caseStudy.videoUrl}
              controls
              preload="metadata"
              playsInline
              className="w-full rounded-md border border-line bg-surface-sunken"
            />
          )}
          {gallery.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.map((image) => (
                <img
                  key={image._key}
                  src={image.url ?? undefined}
                  alt={image.alt[lang]}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-md border border-line object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ),
    })
  }

  return (
    <Container className="flex flex-col gap-8 pt-8 pb-16 md:gap-12 md:pt-12 md:pb-24">
      <header className="flex flex-col items-start gap-6">
        <Button variant="ghost" size="small" href="/#projects">
          {t('caseStudy.back')}
        </Button>
        {(role || dates) && (
          <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ink-muted">
            {role && <span className="type-label">{role}</span>}
            {dates && <span className="type-code">{dates}</span>}
          </p>
        )}
        <h1 className="m-0 max-w-240 type-display-l text-ink md:type-display-xl">{caseStudy.title[lang]}</h1>
        {summary && <p className="m-0 max-w-180 type-lede text-ink-muted">{summary}</p>}
        {(caseStudy.liveUrl || caseStudy.githubUrl) && (
          <div className="flex flex-wrap gap-3">
            {caseStudy.liveUrl && (
              <Button variant="secondary" icon={ExternalLink} href={caseStudy.liveUrl} target="_blank" rel="noreferrer">
                {t('caseStudy.visit')}
              </Button>
            )}
            {caseStudy.githubUrl && (
              <Button variant="secondary" icon={Code} href={caseStudy.githubUrl} target="_blank" rel="noreferrer">
                {t('caseStudy.source')}
              </Button>
            )}
          </div>
        )}
      </header>

      {results.length > 0 && (
        <section aria-labelledby="results-heading" className="border-y border-line py-6">
          <h2 id="results-heading" className="sr-only">
            {t('caseStudy.results')}
          </h2>
          <div className="grid grid-cols-2 items-end gap-6 md:grid-cols-4 md:gap-12">
            {results.map((result, i) => (
              <Metric
                key={result._key}
                value={result}
                label={result.label[lang]}
                emphasis={i === 0 ? 'accent' : 'plain'}
              />
            ))}
          </div>
        </section>
      )}

      {caseStudy.cover?.url && (
        <img
          src={caseStudy.cover.url}
          alt={caseStudy.cover.alt[lang]}
          width={2240}
          height={1120}
          className="aspect-2/1 h-auto w-full rounded-md border border-line bg-surface-sunken object-cover"
        />
      )}

      {parts.length > 0 && (
        <div className="flex flex-col gap-8 md:gap-12">
          {parts.map((part, i) => (
            <section
              key={part.id}
              aria-labelledby={`part-${part.id}`}
              className="flex flex-col gap-3 md:flex-row md:gap-6"
            >
              <h2 id={`part-${part.id}`} className="m-0 shrink-0 md:w-58">
                <Callout number={i + 1} label={part.label} />
              </h2>
              <div className="min-w-0 flex-1 md:max-w-180">{part.content}</div>
            </section>
          ))}
        </div>
      )}

      {next && (
        <nav aria-labelledby="next-heading" className="flex flex-col gap-3">
          <h2 id="next-heading" className="m-0 type-label text-ink-muted">
            {t('caseStudy.next')}
          </h2>
          <ArchiveRow caseStudy={next} lang={lang} />
        </nav>
      )}
    </Container>
  )
}
