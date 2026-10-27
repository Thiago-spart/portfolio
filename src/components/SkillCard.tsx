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
      className="rounded-2xl border-l-2 bg-surface-raised p-5"
      style={{
        borderColor: 'var(--mangrove)',
      }}
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-mangrove">
        {group.label[lang]}
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleTechs.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs text-ink-muted"
          >
            {tech}
          </span>
        ))}
        {hasOverflow && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-full border border-line bg-transparent px-3 py-1 text-xs font-semibold text-mangrove transition hover:bg-surface-raised"
          >
            {expanded ? 'Show less' : `+${hiddenCount} more`}
          </button>
        )}
      </div>
    </div>
  )
}
