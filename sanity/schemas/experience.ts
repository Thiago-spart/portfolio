import { defineArrayMember, defineField, defineType } from 'sanity'
import { CaseIcon } from '@sanity/icons/Case'

// Legacy: read by the live site until the switch to `role` (#47).
export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({ name: 'company',     title: 'Company',      type: 'string' }),
    defineField({ name: 'companyUrl',  title: 'Company URL',  type: 'url' }),
    defineField({ name: 'companyLogo', title: 'Company Logo', type: 'image' }),
    defineField({ name: 'role',        title: 'Role',         type: 'localeString' }),
    defineField({ name: 'description', title: 'Description',  type: 'localeString' }),
    defineField({ name: 'startDate',   title: 'Start Date',   type: 'date' }),
    defineField({ name: 'endDate',     title: 'End Date',     type: 'date' }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'value', title: 'Value', type: 'string' }),
          defineField({ name: 'label', title: 'Label', type: 'localeString' }),
        ],
        preview: { select: { title: 'value', subtitle: 'label.en' } },
      })],
    }),
  ],
  orderings: [{ title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
  preview: {
    select: { title: 'company', subtitle: 'role.en', media: 'companyLogo' },
  },
})
