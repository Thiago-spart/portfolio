import { defineArrayMember, defineField, defineType } from 'sanity'
import { TagsIcon } from '@sanity/icons/Tags'

// Legacy: read by the live site until `tech` replaces it (#43, #47).
export const skillCategory = defineType({
  name: 'skillCategory',
  title: 'Skill Category',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({ name: 'category', title: 'Category', type: 'localeString' }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name',               type: 'string' }),
          defineField({ name: 'icon', title: 'Icon (lucide name)', type: 'string' }),
        ],
        preview: { select: { title: 'name', subtitle: 'icon' } },
      })],
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'category.en', skills: 'skills' },
    prepare: ({ title, skills }) => ({
      title: title ?? 'Untitled category',
      subtitle: Array.isArray(skills) ? `${skills.length} skills` : undefined,
    }),
  },
})
