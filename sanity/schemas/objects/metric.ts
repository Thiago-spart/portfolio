import { defineField, defineType } from 'sanity'
import type { ValidationContext } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'

// One shape for every result: "40 → 95 · Lighthouse", "−96% · Production bugs".

const QUALIFIERS = [
  { title: 'At least (95+)', value: 'atLeast' },
  { title: 'Change (+40%)',  value: 'change' },
]

// A change is measured against an unstated baseline, so it can't also have
// a "before" value (that would be a before → after pair instead).
export function changeHasNoBefore(value: unknown, context: ValidationContext) {
  const before = (context.parent as { before?: number } | undefined)?.before
  return value === 'change' && before != null ? 'A change has no Before value: clear Before or the qualifier' : true
}
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
      name: 'qualifier',
      title: 'Qualifier',
      type: 'string',
      description:
        'Optional. "At least" adds a trailing + ("95+", "80%+"). "Change" marks a value with no baseline '
        + 'and always shows its sign ("+40%", "−96%"); store a decrease as a negative After. '
        + 'Leave empty for a plain level ("80%") or a Before → After pair.',
      options: { list: QUALIFIERS, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.custom(changeHasNoBefore),
    }),
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
    select: { before: 'before', after: 'after', unit: 'unit', qualifier: 'qualifier', label: 'label.en', direction: 'direction' },
    prepare: ({ before, after, unit, qualifier, label, direction }) => ({
      title: [formatMetric({ before, after, unit, qualifier }), label].filter(Boolean).join(' · '),
      subtitle: direction === 'down' ? 'Lower is better' : 'Higher is better',
    }),
  },
})

const MINUS = '\u2212' // a real minus sign, not a hyphen

/**
 * "40 → 95", "23% → 9%", "−96%", "95+", "80%+", "+40%". The unit is appended
 * to both values; negatives print with U+2212.
 */
export function formatMetric({ before, after, unit, qualifier }: { before?: number; after?: number; unit?: string; qualifier?: string }) {
  const value = (n?: number) => (n == null ? '?' : `${n < 0 ? MINUS : ''}${Math.abs(n)}${unit ?? ''}`)
  let text = before == null ? value(after) : `${value(before)} → ${value(after)}`
  if (qualifier === 'change' && before == null && after != null && after > 0) text = `+${text}`
  if (qualifier === 'atLeast') text = `${text}+`
  return text
}

// A case study's results as picker options (see heroResult). Reads the
// published document: the site only renders published data.
export type ResultOption = { _key: string; before?: number; after?: number; unit?: string; qualifier?: string; label?: string }

export const CASE_STUDY_RESULTS_QUERY =
  '*[_id == $id][0].results[]{ _key, before, after, unit, qualifier, "label": label.en }'
