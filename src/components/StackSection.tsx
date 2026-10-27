import { Section } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import StackGroup from './StackGroup'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup as Group } from '#/lib/stack'

interface Props {
  groups: Group[]
  // How many case studies the counts are out of (the lede quotes it).
  caseStudyCount: number
  lang: Lang
}

// Figma: Sections / Stack (37:5868, 37:6324). One row per category between
// hairlines; each Tag counts the case studies that use it.
export default function StackSection({ groups, caseStudyCount, lang }: Props) {
  const { t } = useTranslation()

  return (
    <Section
      id="stack"
      heading={t('stack.title')}
      lede={t('stack.lede').replace('{count}', String(caseStudyCount))}
    >
      <ul className="m-0 list-none border-b border-line p-0">
        {groups.map((group) => (
          <StackGroup key={group.key} group={group} lang={lang} />
        ))}
      </ul>
    </Section>
  )
}
