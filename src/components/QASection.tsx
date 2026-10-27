// src/components/QASection.tsx
import { useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import RichText from './RichText'
import type { Lang } from '#/i18n/LanguageContext'
import type { FAQ_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  items: FAQ_QUERY_RESULT
  lang: Lang
}

export default function QASection({ items, lang }: Props) {
  const { t } = useTranslation()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <section id="qa" className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-mangrove">
          {t('qa.title')}
        </p>

        {/* Chat window */}
        <div
          className="overflow-hidden rounded-2xl border border-line bg-surface-raised"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-ink-muted">ask_thiago.sh</span>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 p-4">
            {items.map((item) => {
              const isOpen = openIds.has(item._id)
              return (
                <div key={item._id} className="flex flex-col gap-2">
                  {/* Question bubble — left */}
                  <button
                    onClick={() => toggle(item._id)}
                    className="self-start rounded-2xl rounded-tl-sm border border-line bg-surface-raised px-4 py-2.5 text-left text-sm text-ink-muted transition hover:border-line"
                  >
                    {item.question[lang]}
                  </button>

                  {/* Answer bubble — right */}
                  {isOpen && (
                    <div
                      className="self-end rounded-2xl rounded-tr-sm border border-line bg-surface-raised px-4 py-2.5 text-sm text-ink-muted"
                      style={{ maxWidth: '85%' }}
                    >
                      <RichText value={item.answer[lang]} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
