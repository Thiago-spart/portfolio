import { useTranslation } from '#/i18n/useTranslation'
import SkillCard from './SkillCard'
import type { SanitySkillCategory, Lang } from '#/types/sanity'

interface Props {
  categories: SanitySkillCategory[]
  lang: Lang
}

export default function SkillsSection({ categories, lang }: Props) {
  const { t } = useTranslation()

  return (
    <section id="skills" className="cyberpunk-surface px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#00aaff]">
          {t('skills.title')}
        </p>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <div
              key={cat._id}
              className="rise-in opacity-0"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <SkillCard category={cat} lang={lang} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
