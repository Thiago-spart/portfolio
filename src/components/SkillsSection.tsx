import { useTranslation } from '#/i18n/useTranslation'
import SkillCard from './SkillCard'
import type { Lang } from '#/i18n/LanguageContext'
import type { StackGroup } from '#/lib/stack'

interface Props {
  groups: StackGroup[]
  lang: Lang
}

export default function SkillsSection({ groups, lang }: Props) {
  const { t } = useTranslation()

  return (
    <section id="skills" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-mangrove">
          {t('skills.title')}
        </p>

        {/* Stack: techs used by case studies and roles, by category */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {groups.map((group) => (
            <SkillCard key={group.category} group={group} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
