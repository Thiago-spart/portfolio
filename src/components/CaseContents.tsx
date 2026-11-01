import { useTranslation } from '#/i18n/useTranslation'
import { cn } from '#/lib/utils'
import { useReadingSection } from '#/lib/useReadingSection'
import { Callout } from './ui/Callout'

interface CaseContentsProps {
  // The numbered parts in page order; each renders as <section id="part-<id>">.
  parts: ReadonlyArray<{ id: string; label: string }>
}

// Every row is the same height, so the marker moves by whole rows.
const ROW = 'h-9'

// A case study's contents (#75). From 1024px, a sticky list beside the
// numbered parts, using the same numbered Callouts, with a 2px mangrove
// marker on the rail that slides to the part being read (aria-current=
// "location"). The site header doesn't stick and the sheet index is a home
// page thing, so the list pins just under the top edge. It follows whatever
// parts render. Below 1024px it isn't shown: the parts are short on a phone.
// Reading position comes from the shared reading band (IntersectionObserver
// only); the marker moves with a CSS transition, none under reduced motion.
export function CaseContents({ parts }: CaseContentsProps) {
  const { t } = useTranslation()
  const current = useReadingSection(parts.map((part) => `part-${part.id}`))
  const index = parts.findIndex((part) => `part-${part.id}` === current)

  return (
    <nav aria-label={t('caseStudy.contents')} className="sticky top-12 hidden self-start lg:block">
      <div className="relative border-l border-line">
        <ol className="m-0 list-none p-0">
          {parts.map((part, i) => (
            <li key={part.id} className={cn('flex', ROW)}>
              <a
                href={`#part-${part.id}`}
                aria-current={index === i ? 'location' : undefined}
                className="flex items-center pl-3 text-ink-muted no-underline transition-colors duration-150 ease-out hover:text-ink focus-visible:-outline-offset-2 aria-[current=location]:text-ink"
              >
                <Callout number={i + 1} label={part.label} className="bg-transparent text-inherit" />
              </a>
            </li>
          ))}
        </ol>
        <span
          aria-hidden="true"
          data-shown={index >= 0}
          style={{ translate: `0 ${Math.max(index, 0) * 100}%` }}
          className={cn(
            'pointer-events-none absolute top-0 -left-px w-0.5 bg-mangrove opacity-0 data-[shown=true]:opacity-100',
            'transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none',
            ROW,
          )}
        />
      </div>
    </nav>
  )
}
