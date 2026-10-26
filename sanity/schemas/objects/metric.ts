import { defineField, defineType } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'

// One shape for every result: "40 → 95 · Lighthouse", "−96% · Production bugs".
export const metric = defineType({
  name: 'metric',
  title: 'Metric',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({ name: 'before',    title: 'Before', type: 'number', description: 'Optional. Shown struck through.' }),
    defineField({ name: 'after',     title: 'After',  type: 'number', validation: (rule) => rule.required() }),
    defineField({ name: 'unit',      title: 'Unit',   type: 'string', description: 'Appended to both values, e.g. %, s, ms, x' }),
    defineField({ name: 'label',     title: 'Label',  type: 'localeString', validation: (rule) => rule.required() }),
    defineField({
      name: 'direction',
      title: 'Better when',
      type: 'string',
      options: {
        list: [
          { title: 'Up (higher is better)',  value: 'up' },
          { title: 'Down (lower is better)', value: 'down' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'up',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { before: 'before', after: 'after', unit: 'unit', label: 'label.en', direction: 'direction' },
    prepare: ({ before, after, unit, label, direction }) => ({
      title: [formatMetric({ before, after, unit }), label].filter(Boolean).join(' · '),
      subtitle: direction === 'down' ? 'Lower is better' : 'Higher is better',
    }),
  },
})

export function formatMetric({ before, after, unit }: { before?: number; after?: number; unit?: string }) {
  const value = (n?: number) => (n == null ? '?' : `${n}${unit ?? ''}`)
  return before == null ? value(after) : `${value(before)} → ${value(after)}`
}

// A case study's results as picker options (see heroResult). Reads the
// published document: the site only renders published data.
export type ResultOption = { _key: string; before?: number; after?: number; unit?: string; label?: string }

export const CASE_STUDY_RESULTS_QUERY =
  '*[_id == $id][0].results[]{ _key, before, after, unit, "label": label.en }'
