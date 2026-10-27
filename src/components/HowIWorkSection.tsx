import { useId, useState } from 'react'
import { Container } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import RichText from './RichText'
import type { Lang } from '#/i18n/LanguageContext'
import type { FAQ_QUERY_RESULT } from '#/types/sanity.generated'

type Item = FAQ_QUERY_RESULT[number]

interface Props {
  items: FAQ_QUERY_RESULT
  lang: Lang
}

// Number, question, toggle: the answer lines up under the question column.
const COLUMNS = 'grid grid-cols-[--spacing(8)_minmax(0,1fr)_--spacing(6)] gap-x-4'

// Figma: Components / Question (38:523). The header is a disclosure button
// (aria-expanded, aria-controls); the answer stays in the DOM, hidden when
// closed, so find-in-page and crawlers still see it.
function Question({
  item,
  number,
  lang,
  open,
  onToggle,
}: {
  item: Item
  number: number
  lang: Lang
  open: boolean
  onToggle: () => void
}) {
  const id = useId()
  const buttonId = `${id}-question`
  const answerId = `${id}-answer`

  return (
    <li className="flex flex-col gap-3 border-b border-line py-6">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={onToggle}
          className={`group ${COLUMNS} w-full cursor-pointer items-start rounded-sm border-0 bg-transparent p-0 text-left`}
        >
          <span className="type-code text-ink-muted">{String(number).padStart(2, '0')}</span>
          <span className="type-title text-ink transition-colors duration-150 ease-out group-hover:text-mangrove">
            {item.question[lang]}
          </span>
          <span aria-hidden="true" className="text-center type-metric-s text-ink-muted">
            {open ? '−' : '+'}
          </span>
        </button>
      </h3>
      <div id={answerId} role="region" aria-labelledby={buttonId} hidden={!open} className={COLUMNS}>
        <RichText value={item.answer[lang]} className="col-start-2 max-w-[65ch] type-body text-ink-muted" />
      </div>
    </li>
  )
}

// Figma: Sections / How I work (38:2632, 38:2686). From 1024px the heading
// and lede sit in a 352 column beside the questions; stacked below that.
// The first question starts open.
export default function HowIWorkSection({ items, lang }: Props) {
  const { t } = useTranslation()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(items.slice(0, 1).map((item) => item._id)))

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section id="how-i-work" aria-labelledby="how-i-work-heading" className="scroll-mt-16 py-16 md:py-24">
      <Container className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex flex-col gap-3 lg:w-88 lg:shrink-0">
          <h2 id="how-i-work-heading" className="m-0 type-heading text-ink">
            {t('howIWork.title')}
          </h2>
          <p className="m-0 type-lede text-ink-muted">{t('howIWork.lede')}</p>
        </div>
        <ol className="m-0 min-w-0 flex-1 list-none border-t border-line p-0">
          {items.map((item, i) => (
            <Question
              key={item._id}
              item={item}
              number={i + 1}
              lang={lang}
              open={openIds.has(item._id)}
              onToggle={() => toggle(item._id)}
            />
          ))}
        </ol>
      </Container>
    </section>
  )
}
