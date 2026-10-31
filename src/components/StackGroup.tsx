import { Tag } from '#/components/ui/Tag'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup as Group } from '#/lib/stack'

interface Props {
  group: Group
  lang: Lang
}

// Figma: Components / Stack group (37:570): the row's Tags, most-used first,
// each with how many case studies use it.
// One category row of the Stack section. Wide (640+): the category in a 232
// column beside the tags; Compact: the category above them.
export default function StackGroup({ group, lang }: Props) {
  return (
    <li className="flex flex-col gap-3 border-t border-line py-4 sm:flex-row sm:gap-6">
      <h3 className="m-0 type-label text-ink-muted sm:w-58 sm:shrink-0">{group.label[lang]}</h3>
      <ul className="m-0 flex min-w-0 flex-1 list-none flex-wrap items-center gap-2 p-0">
        {group.techs.map((tech) => (
          <li key={tech.name} className="flex">
            <Tag label={tech.name} core={tech.core} count={tech.count > 0 ? tech.count : undefined} />
          </li>
        ))}
      </ul>
    </li>
  )
}
