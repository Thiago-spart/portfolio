import type { Rule } from 'sanity'

export const localeString = {
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    { name: 'en', title: 'English',    type: 'string', validation: (Rule: Rule) => Rule.required() },
    { name: 'pt', title: 'Portuguese', type: 'string', validation: (Rule: Rule) => Rule.required() },
    { name: 'es', title: 'Spanish',    type: 'string', validation: (Rule: Rule) => Rule.required() },
  ],
}
