import { Section } from '#/components/ui/Section'
import { useTranslation } from '#/i18n/useTranslation'
import TimelineEntry from './TimelineEntry'
import type { Lang } from '#/i18n/LanguageContext'
import type { ROLES_QUERY_RESULT } from '#/types/sanity.generated'

interface Props {
  roles: ROLES_QUERY_RESULT
  lang: Lang
}

// Figma: Sections / Experience (35:851, 35:1341). Roles newest first on one
// rail; the lede counts them ("Six roles since 2019"), spelling the count
// out while there's a word for it.
export default function TimelineSection({ roles, lang }: Props) {
  const { t } = useTranslation()
  const words = t('experience.countWords').split(',')
  const count = words[roles.length - 1] ?? String(roles.length)
  const since = Math.min(...roles.map((role) => Number(role.startDate.slice(0, 4))))
  const lede =
    roles.length > 0
      ? t('experience.lede').replace('{count}', count).replace('{year}', String(since))
      : undefined

  return (
    <Section id="experience" heading={t('experience.title')} lede={lede}>
      <ol className="m-0 list-none p-0">
        {roles.map((role, i) => (
          <li key={role._id}>
            <TimelineEntry entry={role} lang={lang} last={i === roles.length - 1} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
