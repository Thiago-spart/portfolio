import { defineArrayMember, defineField, defineType } from 'sanity'
import { ProjectsIcon } from '@sanity/icons/Projects'

// Legacy: read by the live site until the switch to `caseStudy` (#47).
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({ name: 'title',            title: 'Title',             type: 'localeString' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.en' },
      // The slug type already validates uniqueness within its document type.
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'shortDescription', title: 'Short Description', type: 'localeString' }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'localeText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({
      name: 'challenges',
      title: 'Challenges',
      type: 'array',
      of: [defineArrayMember({ type: 'localeString' })],
    }),
    defineField({ name: 'coverImage',       title: 'Cover Image',       type: 'image' }),
    defineField({ name: 'gallery',          title: 'Gallery',           type: 'array', of: [defineArrayMember({ type: 'image' })] }),
    defineField({ name: 'video',            title: 'Video',             type: 'file', options: { accept: 'video/*' } }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['web', 'mobile', 'api', 'other'] },
    }),
    defineField({ name: 'liveUrl',   title: 'Live URL',   type: 'url' }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'endDate',   title: 'End Date',   type: 'date' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['completed', 'in-progress', 'archived'] },
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean' }),
  ],
  orderings: [{ title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
  preview: {
    select: { title: 'title.en', category: 'category', featured: 'featured', media: 'coverImage' },
    prepare: ({ title, category, featured, media }) => ({
      title: title ?? 'Untitled project',
      subtitle: [category, featured ? 'featured' : null].filter(Boolean).join(' · '),
      media,
    }),
  },
})
