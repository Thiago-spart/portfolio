import { createFileRoute } from '@tanstack/react-router'
import { defineQuery } from 'groq'
import { sanityClient } from '#/lib/sanity'
import { STACK_QUERY } from '#/lib/queries/stack'
import { SITE_SETTINGS_QUERY } from '#/lib/queries/siteSettings'
import { groupStack } from '#/lib/stack'
import { formatMetric } from '#/lib/metric'
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  LINKEDIN_URL,
  SITE_NAME,
  SITE_URL,
} from '#/lib/seo'

const LLMS_CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)]
  | order(tier desc, order asc, startDate desc) {
  "title": title.en,
  "slug": slug.current,
  "summary": summary.en,
  "results": results[]{ before, after, unit, "label": label.en }
}`)

// Rich-text answers flattened to plain text for the digest.
const LLMS_FAQ_QUERY = defineQuery(`*[_type == "faq"] | order(order asc) {
  "question": question.en,
  "answer": pt::text(answer.en)
}`)

// llms.txt convention (llmstxt.org): a plain-markdown digest at the site
// root so AI agents/crawlers can ground themselves without parsing HTML/JS.
// Generated at request time so it stays in sync with Sanity content.
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const [caseStudies, techs, faqs, settings] = await Promise.all([
          sanityClient.fetch(LLMS_CASE_STUDIES_QUERY),
          sanityClient.fetch(STACK_QUERY),
          sanityClient.fetch(LLMS_FAQ_QUERY),
          sanityClient.fetch(SITE_SETTINGS_QUERY),
        ])

        const projectLines = caseStudies
          .map((p) => {
            const results = (p.results ?? []).map((r) => `${formatMetric(r)} ${r.label}`).join('; ')
            const summary = [p.summary, results && `Results: ${results}.`].filter(Boolean).join(' ')
            return `- [${p.title}](${SITE_URL}/projects/${p.slug})${summary ? `: ${summary}` : ''}`
          })
          .join('\n')

        const stackLines = groupStack(techs)
          .map((group) => `- ${group.label.en}: ${group.techs.join(', ')}`)
          .join('\n')

        const qaLines = faqs.map((qa) => `- Q: ${qa.question}\n  A: ${qa.answer}`).join('\n')

        const email    = settings?.email ?? AUTHOR_EMAIL
        const linkedin = settings?.linkedin ?? LINKEDIN_URL
        const github   = settings?.github ? `\n- GitHub: ${settings.github}` : ''

        const body = `# ${SITE_NAME} — Full-Stack Developer

> ${DEFAULT_DESCRIPTION}

${AUTHOR_NAME} is a full-stack developer working across React, Next.js, TypeScript, Node.js, and React Native, with production experience in micro-frontend architecture, performance/accessibility engineering, and AI-driven development workflows.

## Contact
- Email: mailto:${email}
- LinkedIn: ${linkedin}${github}
- Site: ${SITE_URL}

## Projects
${projectLines}

## Stack
${stackLines}

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
