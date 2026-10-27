import { useId, useState } from 'react'
import { Button } from '#/components/ui/Button'
import { Tag } from '#/components/ui/Tag'
import { useTranslation } from '#/i18n/useTranslation'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup as Group } from '#/lib/stack'

interface Props {
  group: Group
  lang: Lang
}

// Figma: Components / Stack group (37:570): up to eight Tags, most-used
// first, then "+N more" expands the rest in place.
const VISIBLE = 8

// One category row of the Stack section. Wide (640+): the category in a 232
// column beside the tags; Compact: the category above them.
export default function StackGroup({ group, lang }: Props) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const tagsId = useId()
  const hidden = Math.max(group.techs.length - VISIBLE, 0)
  const techs = expanded ? group.techs : group.techs.slice(0, VISIBLE)

  return (
    <li className="flex flex-col gap-3 border-t border-line py-4 sm:flex-row sm:gap-6">
      <h3 className="m-0 type-label text-ink-muted sm:w-58 sm:shrink-0">{group.label[lang]}</h3>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <ul id={tagsId} className="contents">
          {techs.map((tech) => (
            <li key={tech.name} className="flex">
              <Tag label={tech.name} core={tech.core} count={tech.count > 0 ? tech.count : undefined} />
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <Button
            variant="ghost"
            size="small"
            aria-expanded={expanded}
            aria-controls={tagsId}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? t('stack.less') : t('stack.more').replace('{count}', String(hidden))}
          </Button>
        )}
      </div>
    </li>
  )
}
