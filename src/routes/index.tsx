import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchProjects }    from '#/lib/queries/projects'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import { useLanguage }      from '#/i18n/LanguageContext'
import { routeHead }        from '#/lib/seo'
import HeroSection          from '#/components/HeroSection'
import TimelineSection      from '#/components/TimelineSection'
import ProjectsSection      from '#/components/ProjectsSection'
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
    const [experiences, projects, qa, skills] = await Promise.all([
      fetchExperiences(),
      fetchProjects(),
      fetchQA(),
      fetchSkills(),
    ])
    return { experiences, projects, qa, skills }
  },
  component: HomePage,
})

function HomePage() {
  const { experiences, projects, qa, skills } = Route.useLoaderData()
  const { lang } = useLanguage()

  return (
    <main>
      <HeroSection />
      <TimelineSection experiences={experiences} lang={lang} />
      <ProjectsSection projects={projects} lang={lang} />
      <SkillsSection categories={skills} lang={lang} />
      <QASection items={qa} lang={lang} />
      <ContactSection />
    </main>
  )
}
