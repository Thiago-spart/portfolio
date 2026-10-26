import { defineField, defineType } from 'sanity'
import type { Reference, ValidationContext } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import { ResultKeyInput } from '../../components/ResultKeyInput'
import { CASE_STUDY_RESULTS_QUERY, formatMetric, type ResultOption } from './metric'

// A hero result points at one metric inside a case study's `results`, so
// every number on the hero is backed by a case study.
export async function resultKeyExists(key: string | undefined, context: ValidationContext) {
  if (!key) return 'Pick a result'
  const ref = (context.parent as { caseStudy?: Reference } | undefined)?.caseStudy?._ref
  if (!ref) return true // the caseStudy field reports its own error
  const client = context.getClient({ apiVersion: '2024-01-01' })
  const results = await client.fetch<ResultOption[] | null>(CASE_STUDY_RESULTS_QUERY, { id: ref })
  return results?.some((r) => r._key === key) || 'This result is not in the published case study'
}

export const heroResult = defineType({
  name: 'heroResult',
  title: 'Hero result',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'caseStudy',
      title: 'Case study',
      type: 'reference',
      to: [{ type: 'caseStudy' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'resultKey',
      title: 'Result',
      type: 'string',
      description: 'One of the case study\'s results (stored as its _key).',
      components: { input: ResultKeyInput },
      validation: (rule) => rule.custom(resultKeyExists),
    }),
  ],
  preview: {
    select: { caseStudy: 'caseStudy.title.en', results: 'caseStudy.results', resultKey: 'resultKey' },
    prepare: ({ caseStudy, results, resultKey }) => {
      const result = (results as (ResultOption & { label?: { en?: string } })[] | undefined)
        ?.find((r) => r._key === resultKey)
      return {
        title: result ? [formatMetric(result), result.label?.en].filter(Boolean).join(' · ') : 'No result selected',
        subtitle: caseStudy,
      }
    },
  },
})
