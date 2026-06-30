import { createFileRoute } from '@tanstack/react-router'
import { fetchExperiences } from '#/lib/queries/experiences'
import { fetchQA }          from '#/lib/queries/qa'
import { fetchSkills }      from '#/lib/queries/skills'
import HeroSection          from '#/components/HeroSection'

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
  return (
    <main>
      <HeroSection />
      {/* Remaining sections added in Task 16 */}
    </main>
  )
}
