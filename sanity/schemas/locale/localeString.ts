import { defineField, defineType } from 'sanity'
import { TranslateIcon } from '@sanity/icons/Translate'

export const localeString = defineType({
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  icon: TranslateIcon,
  fields: [
    defineField({ name: 'en', title: 'English',    type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'pt', title: 'Portuguese', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'es', title: 'Spanish',    type: 'string', validation: (rule) => rule.required() }),
  ],
})
