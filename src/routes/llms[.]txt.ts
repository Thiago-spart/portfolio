import { createFileRoute } from '@tanstack/react-router'
import { sanityClient } from '#/lib/sanity'
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  LINKEDIN_URL,
  SITE_NAME,
  SITE_URL,
} from '#/lib/seo'

interface LlmsProject {
  title: string
  slug: string
  shortDescription: string
}

interface LlmsSkillCategory {
  category: string
  skills: string[]
}

interface LlmsQa {
  question: string
  answer: string
}

const projectsQuery = `*[_type == "project"] | order(startDate desc) {
  "title": title.en,
  "slug": slug.current,
  "shortDescription": shortDescription.en
}`

const skillsQuery = `*[_type == "skillCategory"] | order(order asc) {
  "category": category.en,
  "skills": skills[].name
}`

const qaQuery = `*[_type == "qa"] | order(order asc) {
  "question": question.en,
  "answer": answer.en
}`

// llms.txt convention (llmstxt.org): a plain-markdown digest at the site
// root so AI agents/crawlers can ground themselves without parsing HTML/JS.
// Generated at request time so it stays in sync with Sanity content.
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const [projects, skillCategories, qas] = await Promise.all([
          sanityClient.fetch<LlmsProject[]>(projectsQuery),
          sanityClient.fetch<LlmsSkillCategory[]>(skillsQuery),
          sanityClient.fetch<LlmsQa[]>(qaQuery),
        ])

        const projectLines = projects
          .map((p) => `- [${p.title}](${SITE_URL}/projects/${p.slug}): ${p.shortDescription}`)
          .join('\n')

        const skillLines = skillCategories
          .map((c) => `- ${c.category}: ${c.skills.join(', ')}`)
          .join('\n')

        const qaLines = qas.map((qa) => `- Q: ${qa.question}\n  A: ${qa.answer}`).join('\n')

        const body = `# ${SITE_NAME} — Full-Stack Developer

> ${DEFAULT_DESCRIPTION}

${AUTHOR_NAME} is a full-stack developer working across React, Next.js, TypeScript, Node.js, and React Native, with production experience in micro-frontend architecture, performance/accessibility engineering, and AI-driven development workflows.

## Contact
- Email: mailto:${AUTHOR_EMAIL}
- LinkedIn: ${LINKEDIN_URL}
- Site: ${SITE_URL}

## Projects
${projectLines}

## Skills
${skillLines}

## Q&A
${qaLines}
`

        return new Response(body, {
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        })
      },
    },
  },
})
