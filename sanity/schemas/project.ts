import type { Rule } from 'sanity'

export const project = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    { name: 'title',            title: 'Title',             type: 'localeString' },
    { name: 'slug',             title: 'Slug',              type: 'slug', options: { source: 'title.en' } },
    { name: 'shortDescription', title: 'Short Description', type: 'localeString' },
    {
      name: 'longDescription',
      title: 'Long Description',
      type: 'localeText',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'localeString' }],
    },
    {
      name: 'challenges',
      title: 'Challenges',
      type: 'array',
      of: [{ type: 'localeString' }],
    },
    { name: 'coverImage',       title: 'Cover Image',       type: 'image' },
    { name: 'gallery',          title: 'Gallery',           type: 'array', of: [{ type: 'image' }] },
    { name: 'video',            title: 'Video',             type: 'file', options: { accept: 'video/*' } },
    {
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule: Rule) => Rule.required().min(1),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['web', 'mobile', 'api', 'other'] },
    },
    { name: 'liveUrl',   title: 'Live URL',    type: 'url' },
    { name: 'githubUrl', title: 'GitHub URL',  type: 'url' },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: (Rule: Rule) => Rule.required(),
    },
    { name: 'endDate',   title: 'End Date',    type: 'date' },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['completed', 'in-progress', 'archived'] },
    },
    { name: 'featured', title: 'Featured', type: 'boolean' },
  ],
}
