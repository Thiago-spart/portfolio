import { defineArrayMember, defineField, defineType } from 'sanity'
import { BlockContentIcon } from '@sanity/icons/BlockContent'

// Deliberately small: paragraphs and lists with a few inline marks. Case
// study problem/approach and FAQ answers are prose, not page layouts.
const block = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [
    { title: 'Bullet',   value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Strong',   value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Code',     value: 'code' },
    ],
    annotations: [
      defineArrayMember({
        name: 'link',
        title: 'Link',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: (rule) => rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
          }),
        ],
      }),
    ],
  },
})

export const localeBlock = defineType({
  name: 'localeBlock',
  title: 'Localized Rich Text',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({ name: 'en', title: 'English',    type: 'array', of: [block], validation: (rule) => rule.required() }),
    defineField({ name: 'pt', title: 'Portuguese', type: 'array', of: [block], validation: (rule) => rule.required() }),
    defineField({ name: 'es', title: 'Spanish',    type: 'array', of: [block], validation: (rule) => rule.required() }),
  ],
})
