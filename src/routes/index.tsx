import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import { useLanguage }      from '#/i18n/LanguageContext'
import { routeHead }        from '#/lib/seo'
import HeroSection          from '#/components/HeroSection'
import TimelineSection      from '#/components/TimelineSection'
import SkillsSection        from '#/components/SkillsSection'
import QASection            from '#/components/QASection'
import ContactSection       from '#/components/ContactSection'

export const Route = createFileRoute('/')({
  head: () =>
    routeHead({
      title: 'Thiago Souza — Full-Stack Developer',
      description:
        'Full-stack developer building fast, thoughtful web experiences — explore Thiago Souza\'s projects, experience, and skills.',
      path: '/',
    }),
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
