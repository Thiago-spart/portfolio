import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons/Image'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'localeString',
      description: 'Describe what the image shows, for screen readers.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'alt.en', media: 'asset' },
    prepare: ({ title, media }) => ({ title: title ?? 'Missing alt text', media }),
  },
})
