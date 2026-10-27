import { useState } from 'react'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup } from '#/lib/stack'

interface Props {
  group: StackGroup
  lang: Lang
}

const VISIBLE_COUNT = 6

export default function SkillCard({ group, lang }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasOverflow = group.techs.length > VISIBLE_COUNT
  const visibleTechs =
    expanded || !hasOverflow ? group.techs : group.techs.slice(0, VISIBLE_COUNT)
  const hiddenCount = group.techs.length - VISIBLE_COUNT

  return (
    <div
      className="rounded-2xl border-l-2 bg-[rgba(8,13,26,0.85)] p-5"
      style={{
        borderColor: '#00aaff',
        boxShadow: '0 0 20px rgba(0,170,255,0.06) inset',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
        {group.label[lang]}
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleTechs.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-[rgba(0,170,255,0.2)] bg-[rgba(0,170,255,0.05)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]"
          >
            {tech}
          </span>
        ))}
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-full border border-[rgba(0,170,255,0.4)] bg-transparent px-3 py-1 text-xs font-semibold text-[#00aaff] transition hover:bg-[rgba(0,170,255,0.1)]"
          >
            {expanded ? 'Show less' : `+${hiddenCount} more`}
          </button>
        )}
      </div>
    </div>
  )
}
