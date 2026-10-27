import { defineArrayMember, defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons/User'
import { endAfterStart, yearRange } from './dates'

// Case studies point at their role; find them with
// *[_type == "caseStudy" && references(^._id)].
export const role = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'company',    title: 'Company',     type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'companyUrl', title: 'Company URL', type: 'url' }),
    defineField({ name: 'title',      title: 'Title',       type: 'localeString', validation: (rule) => rule.required() }),
    defineField({ name: 'startDate',  title: 'Start Date',  type: 'date', validation: (rule) => rule.required() }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      description: 'Leave empty for a current role.',
      validation: (rule) => rule.custom(endAfterStart),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'localeText',
      description: 'One short paragraph. The detailed story belongs in the case studies.',
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'tech' }] })],
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [{ title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
  preview: {
    select: { company: 'company', title: 'title.en', startDate: 'startDate', endDate: 'endDate' },
    prepare: ({ company, title, startDate, endDate }) => ({
      title: company ?? 'Unnamed company',
      subtitle: [title, yearRange(startDate, endDate)].filter(Boolean).join(' · '),
    }),
  },
})
