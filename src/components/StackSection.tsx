import { Section } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import StackGroup from './StackGroup'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup as Group } from '#/lib/stack'

interface Props {
  groups: Group[]
  lang: Lang
  // The Stack filter: the selected tech (from ?tech=), how many case
  // studies use it, and how to select or clear one.
  selected: string | null
  matches: number
  onSelect: (name: string) => void
}

// Figma: Sections / Stack (37:5868, 37:6324). One row per category between
// hairlines. An index into the work rather than an inventory: selecting a
// tech dims the case studies that don't use it and marks the roles that do
// (src/routes/index.tsx); the count of the ones that do is announced in a
// polite live region under the rows, instead of a count on every tag.
export default function StackSection({ groups, lang, selected, matches, onSelect }: Props) {
  const { t } = useTranslation()
  const result = selected
    ? (matches === 1 ? t('stack.resultOne') : t('stack.result'))
        .replace('{count}', String(matches))
        .replace('{tech}', selected)
    : ''

  return (
    <Section id="stack" heading={t('stack.title')} lede={t('stack.lede')}>
      <ul className="m-0 list-none border-b border-line p-0">
        {groups.map((group) => (
          <StackGroup key={group.key} group={group} lang={lang} selected={selected} onSelect={onSelect} />
        ))}
      </ul>
      {/* Under the rows, its line always kept, so selecting moves nothing. */}
      <p role="status" aria-live="polite" className="m-0 mt-4 min-h-lh type-small text-ink">
        {result}
      </p>
    </Section>
  )
}
