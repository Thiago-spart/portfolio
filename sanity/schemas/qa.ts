import { defineField, defineType } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'

// Legacy: read by the live site until the switch to `faq` (#47).
export const qa = defineType({
  name: 'qa',
  title: 'Q&A',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'localeString' }),
    defineField({ name: 'answer',   title: 'Answer',   type: 'localeString' }),
    defineField({ name: 'order',    title: 'Order',    type: 'number' }),
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
