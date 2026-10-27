import { defineField, defineType } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'

// "How I work": short questions with rich-text answers. llms.txt renders a
// plain-text projection of the answer (pt::text).
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'localeString', validation: (rule) => rule.required() }),
    defineField({ name: 'answer',   title: 'Answer',   type: 'localeBlock',  validation: (rule) => rule.required() }),
    defineField({ name: 'order',    title: 'Order',    type: 'number', description: 'Lowest first.' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'question.en', order: 'order' },
    prepare: ({ title, order }) => ({
      title: title ?? 'Untitled question',
      subtitle: order != null ? `#${order}` : undefined,
    }),
  },
})
