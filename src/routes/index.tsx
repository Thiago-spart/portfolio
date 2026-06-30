import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import { useLanguage }      from '#/i18n/LanguageContext'
import HeroSection          from '#/components/HeroSection'
import TimelineSection      from '#/components/TimelineSection'
import SkillsSection        from '#/components/SkillsSection'
import QASection            from '#/components/QASection'
import ContactSection       from '#/components/ContactSection'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [experiences, qa, skills] = await Promise.all([
      fetchExperiences(),
      fetchQA(),
      fetchSkills(),
    ])
    return { experiences, qa, skills }
  },
  component: HomePage,
})

function HomePage() {
  const { experiences, qa, skills } = Route.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <HeroSection />
      <TimelineSection experiences={experiences} lang={lang} />
      <SkillsSection categories={skills} lang={lang} />
      <QASection items={qa} lang={lang} />
      <ContactSection />
    </main>
  )
}
