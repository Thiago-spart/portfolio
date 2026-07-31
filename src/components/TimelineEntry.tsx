// src/components/TimelineEntry.tsx
import { useState } from 'react'
import { useTranslation } from '#/i18n/useTranslation'
import type { SanityExperience, Lang } from '#/types/sanity'

interface Props {
  entry: SanityExperience
  lang: Lang
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

export default function TimelineEntry({ entry, lang }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const endLabel = entry.endDate ? formatDate(entry.endDate) : t('timeline.present')

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full rounded-2xl border border-[rgba(0,170,255,0.2)] bg-[rgba(8,13,26,0.85)] p-5 text-left transition hover:border-[rgba(0,170,255,0.5)]"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00aaff]">
            {formatDate(entry.startDate)} — {endLabel}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-white">{entry.company}</h3>
          <p className="text-sm text-[#00aaff]">{entry.role[lang]}</p>
        </div>
        <span className="mt-1 text-muted-gray transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-[rgba(255,255,255,0.7)]">{entry.description[lang]}</p>

      {/* Tech stack */}
      <div className="mt-3 flex flex-wrap gap-2">
        {entry.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[rgba(0,170,255,0.3)] bg-[rgba(0,170,255,0.06)] px-2.5 py-0.5 text-[11px] text-[rgba(255,255,255,0.7)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Highlights — expanded */}
      {open && entry.highlights.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(0,170,255,0.15)] pt-4 sm:grid-cols-3">
          {entry.highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-xl border border-[rgba(0,170,255,0.3)] bg-[rgba(0,170,255,0.06)] p-3 text-center"
              style={{ boxShadow: '0 0 12px rgba(0,170,255,0.1) inset' }}
            >
              <p className="text-xl font-bold text-white">{h.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-gray">{h.label[lang]}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
