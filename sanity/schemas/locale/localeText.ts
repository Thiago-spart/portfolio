import { defineField, defineType } from 'sanity'
import { TranslateIcon } from '@sanity/icons/Translate'

export const localeText = defineType({
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  icon: TranslateIcon,
  fields: [
    defineField({ name: 'en', title: 'English',    type: 'text', validation: (rule) => rule.required() }),
    defineField({ name: 'pt', title: 'Portuguese', type: 'text', validation: (rule) => rule.required() }),
    defineField({ name: 'es', title: 'Spanish',    type: 'text', validation: (rule) => rule.required() }),
  ],
})
