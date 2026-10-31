import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Code, ExternalLink } from 'lucide-react'
import { useTranslation } from '#/i18n/useTranslation'
import { formatMonthRange, isCoreTech, type CaseStudyRow } from '#/lib/caseStudy'
import { caseMorph, caseViewTransition } from '#/lib/caseTransition'
import { caseAnchor } from '#/lib/inPage'
import { ArchiveRow } from './ArchiveRow'
import RichText from './RichText'
import { CaseContents } from './CaseContents'
import { Button, buttonVariants } from './ui/Button'
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
// meta, title, summary, live site), results strip, numbered parts (problem,
// decision, approach, stack, then gallery and video when present) with their
// contents beside them from 1024px, and the next case study. The title and
// first metric are where a case card's title and first result morph to
// (src/lib/caseTransition.ts). The cover stays in Sanity but isn't shown:
// the covers are promo cards until real screenshots replace them (#66).
export default function CaseStudyPage({ caseStudy, next, lang }: CaseStudyPageProps) {
  const { t } = useTranslation()
  const dates = formatMonthRange(caseStudy.startDate, caseStudy.endDate, t('work.present'), lang)
  const role = caseStudy.role ? `${caseStudy.role.title[lang]} · ${caseStudy.role.company}` : null
  const summary = caseStudy.summary?.[lang]
  const results = caseStudy.results ?? []
  const stack = caseStudy.stack ?? []
  const gallery = (caseStudy.gallery ?? []).filter((image) => image.url)
  const problem = caseStudy.problem?.[lang]
  const decision = caseStudy.decision?.[lang]
  const approach = caseStudy.approach?.[lang]

  // Parts are numbered in the order they appear, skipping empty ones.
  const parts: Array<{ id: string; label: string; content: ReactNode }> = []
  if (problem?.length) {
    parts.push({ id: 'problem', label: t('caseStudy.problem'), content: <RichText value={problem} className={PROSE} /> })
  }
  if (decision?.length) {
    parts.push({ id: 'decision', label: t('caseStudy.decision'), content: <RichText value={decision} className={PROSE} /> })
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
        {/* A router link, so the morph from the card plays back home, and
            to the card itself (caseAnchor), so the morph ends in view. */}
        <Link
          to="/"
          hash={caseAnchor(caseStudy.slug)}
          viewTransition={caseViewTransition}
          className={buttonVariants({ variant: 'ghost', size: 'small' })}
        >
          {t('caseStudy.back')}
        </Link>
        {(role || dates) && (
          <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ink-muted">
            {role && <span className="type-label">{role}</span>}
            {dates && <span className="type-code">{dates}</span>}
          </p>
        )}
        <h1
          className="m-0 max-w-240 type-display-l text-ink md:type-display-xl"
          style={caseMorph(caseStudy.slug, 'title')}
        >{caseStudy.title[lang]}</h1>
        {summary && <p className="m-0 max-w-152 type-lede text-ink-muted">{summary}</p>}
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
                style={i === 0 ? caseMorph(caseStudy.slug, 'result') : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {parts.length > 0 && (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
          {/* Padding, not gap: the parts touch, so one is always on the
              reading band and the contents marker never blinks off. A
              part reached from the contents starts at 44% of the viewport,
              just above the band, so it covers the band and is the one
              marked (at the top edge it would be above the band). */}
          <div className="flex flex-col">
            {parts.map((part, i) => (
              <section
                key={part.id}
                id={`part-${part.id}`}
                aria-labelledby={`part-${part.id}-heading`}
                className="flex flex-col gap-3 pb-8 last:pb-0 md:flex-row md:gap-6 md:pb-12 lg:scroll-mt-[44vh]"
              >
                <h2 id={`part-${part.id}-heading`} className="m-0 shrink-0 md:w-58">
                  <Callout number={i + 1} label={part.label} />
                </h2>
                <div className="min-w-0 flex-1 md:max-w-measure">{part.content}</div>
              </section>
            ))}
          </div>
          <CaseContents parts={parts} />
        </div>
      )}

      {next && (
        <nav aria-labelledby="next-heading" className="flex flex-col gap-3">
          <h2 id="next-heading" className="m-0 type-label text-ink-muted">
            {t('caseStudy.next')}
          </h2>
          <ArchiveRow caseStudy={next} lang={lang} morph={false} />
        </nav>
      )}
    </Container>
  )
}
