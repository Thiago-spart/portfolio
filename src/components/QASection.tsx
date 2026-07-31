// src/components/QASection.tsx
import { useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import type { SanityQA, Lang } from '#/types/sanity'

interface Props {
  items: SanityQA[]
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
    <section id="qa" className="cyberpunk-surface px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('qa.title')}
        </p>

        {/* Chat window */}
        <div
          className="overflow-hidden rounded-2xl border border-[rgba(0,170,255,0.3)] bg-[rgba(8,13,26,0.9)]"
          style={{ boxShadow: '0 0 0 1px rgba(0,170,255,0.1), 0 24px 48px rgba(0,0,0,0.4)' }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-[rgba(0,170,255,0.15)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-muted-gray">ask_thiago.sh</span>
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
                    className="self-start rounded-2xl rounded-tl-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-left text-sm text-[rgba(255,255,255,0.85)] transition hover:border-[rgba(255,255,255,0.2)]"
                  >
                    {item.question[lang]}
                  </button>

                  {/* Answer bubble — right */}
                  {isOpen && (
                    <div
                      className="cursor-blink self-end rounded-2xl rounded-tr-sm border border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] px-4 py-2.5 text-sm text-[rgba(255,255,255,0.8)]"
                      style={{ maxWidth: '85%' }}
                    >
                      {item.answer[lang]}
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
