import { Tag } from '#/components/ui/Tag'
import { cn } from '#/lib/utils'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup as Group } from '#/lib/stack'

interface Props {
  group: Group
  lang: Lang
  // The tech the Stack filter has selected, if any.
  selected: string | null
  onSelect: (name: string) => void
}

// Figma: Components / Stack group (37:570): the row's Tags, most-used first.
// One category row of the Stack section. Wide (640+): the category in a 232
// column beside the tags; Compact: the category above them.
//
// Each Tag is a toggle button (aria-pressed) for the Stack filter; the
// selected one fills in mangrove. tech-glide (motion.css) slides one
// mangrove outline between the tags as the pointer or focus moves along
// the row.
export default function StackGroup({ group, lang, selected, onSelect }: Props) {
  return (
    <li className="flex flex-col gap-3 border-t border-line py-4 sm:flex-row sm:gap-6">
      <h3 className="m-0 type-label text-ink-muted sm:w-58 sm:shrink-0">{group.label[lang]}</h3>
      <ul className="tech-glide m-0 flex min-w-0 flex-1 list-none flex-wrap items-center gap-2 p-0">
        {group.techs.map((tech) => {
          const pressed = selected === tech.name
          return (
            <li key={tech.name} className="flex">
              <button
                type="button"
                aria-pressed={pressed}
                onClick={() => onSelect(tech.name)}
                className="group/tech flex min-h-11 cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 focus-visible:outline-offset-2 sm:min-h-0"
              >
                <Tag
                  label={tech.name}
                  core={tech.core}
                  className={cn(
                    'transition-colors duration-150 ease-out motion-reduce:transition-none group-hover/tech:border-mangrove',
                    pressed && 'border-mangrove bg-mangrove text-ground',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </li>
  )
}
