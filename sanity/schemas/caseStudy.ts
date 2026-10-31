import { defineArrayMember, defineField, defineType } from 'sanity'
import type { ValidationContext } from 'sanity'
import { ProjectsIcon } from '@sanity/icons/Projects'
import { endAfterStart } from './dates'

const TIERS = [
  { title: 'Featured', value: 'featured' },
  { title: 'Archive',  value: 'archive' },
]

// Featured case studies render as cards with a cover and a headline result,
// so both become mandatory once the tier is "featured".
export function requiredWhenFeatured(message: string) {
  return (value: unknown, context: ValidationContext) => {
    if (context.document?.tier !== 'featured') return true
    const empty = value == null || (Array.isArray(value) && value.length === 0)
    return empty ? message : true
  }
}

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  icon: ProjectsIcon,
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'story',    title: 'Story' },
    { name: 'media',    title: 'Media' },
    { name: 'links',    title: 'Links & dates' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'localeString', group: 'overview', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: { source: 'title.en' },
      // The slug type already validates uniqueness within its document type.
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'reference',
      to: [{ type: 'role' }],
      group: 'overview',
      description: 'Optional. Leave empty for work that sits outside the roles on the timeline.',
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      group: 'overview',
      options: { list: TIERS, layout: 'radio', direction: 'horizontal' },
      initialValue: 'archive',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      group: 'overview',
      description: 'Position among featured case studies (lowest first).',
      hidden: ({ document }) => document?.tier !== 'featured',
    }),
    defineField({ name: 'summary', title: 'Summary', type: 'localeString', group: 'overview' }),
    defineField({ name: 'problem',  title: 'Problem',  type: 'localeBlock', group: 'story' }),
    defineField({
      name: 'decision',
      title: 'Decision',
      type: 'localeBlock',
      group: 'story',
      description: 'The call that shaped the work: what you chose, what else was on the table, and what it cost. Shown between Problem and Approach.',
    }),
    defineField({ name: 'approach', title: 'Approach', type: 'localeBlock', group: 'story' }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      group: 'story',
      of: [defineArrayMember({ type: 'metric' })],
      validation: (rule) => rule.custom(requiredWhenFeatured('Featured case studies need at least one result')),
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      group: 'story',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'tech' }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'cover',
      title: 'Cover',
      type: 'imageWithAlt',
      group: 'media',
      validation: (rule) => rule.custom(requiredWhenFeatured('Featured case studies need a cover image')),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({ type: 'imageWithAlt' })],
      options: { layout: 'grid' },
    }),
    defineField({ name: 'video',     title: 'Video',      type: 'file', group: 'media', options: { accept: 'video/*' } }),
    defineField({ name: 'liveUrl',   title: 'Live URL',   type: 'url',  group: 'links' }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url',  group: 'links' }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'date', group: 'links' }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      group: 'links',
      validation: (rule) => rule.custom(endAfterStart),
    }),
  ],
  orderings: [
    { title: 'Featured order', name: 'featuredOrder', by: [{ field: 'tier', direction: 'desc' }, { field: 'order', direction: 'asc' }] },
    { title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title.en', tier: 'tier', company: 'role.company', media: 'cover' },
    prepare: ({ title, tier, company, media }) => ({
      title: title ?? 'Untitled case study',
      subtitle: [TIERS.find((t) => t.value === tier)?.title, company].filter(Boolean).join(' · '),
      media,
    }),
  },
})
