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
// The newest roles show in full; older ones collapse to one line each.
const FULL_ROLES = 2

// Work → Experience: while a Case card or archive row is hovered or its link
// focused, its role's point on the rail grows and fills. CSS only: each card
// carries data-role, each entry data-role-entry, and one :has() rule per
// role pairs them. Sanity ids are letters, digits, dots, dashes and
// underscores; anything else gets no rule rather than an escaped one.
const SAFE_ID = /^[\w.-]+$/

function roleMarkCss(ids: string[]): string {
  const selectors = ids
    .filter((id) => SAFE_ID.test(id))
    .map((id) => `main:has([data-role="${id}"] a:is(:hover, :focus-visible)) [data-role-entry="${id}"] .role-point`)
  if (selectors.length === 0) return ''
  return `${selectors.join(',\n')} { scale: 1.6; }\n${selectors
    .map((sel) => `${sel} circle`)
    .join(',\n')} { fill: var(--mangrove); }`
}

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
      <style>{roleMarkCss(roles.map((role) => role._id))}</style>
      <ol className="m-0 list-none p-0">
        {roles.map((role, i) => (
          <li key={role._id}>
            <TimelineEntry entry={role} lang={lang} last={i === roles.length - 1} compact={i >= FULL_ROLES} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
