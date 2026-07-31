import type { Rule } from 'sanity'

export const localeText = {
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    { name: 'en', title: 'English',    type: 'text', validation: (Rule: Rule) => Rule.required() },
    { name: 'pt', title: 'Portuguese', type: 'text', validation: (Rule: Rule) => Rule.required() },
    { name: 'es', title: 'Spanish',    type: 'text', validation: (Rule: Rule) => Rule.required() },
  ],
}
