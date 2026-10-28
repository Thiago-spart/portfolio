import { defineArrayMember, defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

type HeroResultValue = { caseStudy?: { _ref?: string }; resultKey?: string }

export function distinctHeroResults(items: HeroResultValue[] | undefined) {
  const seen = new Set<string>()
  for (const item of items ?? []) {
    const id = `${item.caseStudy?._ref}:${item.resultKey}`
    if (item.resultKey && seen.has(id)) return 'The same result is picked twice'
    seen.add(id)
  }
  return true
}

// Singleton: the Studio structure edits it at the fixed id "siteSettings";
// sanity.config.ts hides it from "New document" and drops delete/duplicate.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'hero',    title: 'Hero', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'seo',     title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'localeString',
      group: 'hero',
      description: 'One line under the Contact heading, contracts first, e.g. "Taking on contract work. Open to senior and lead roles."',
    }),
    defineField({
      name: 'heroResults',
      title: 'Hero results',
      type: 'array',
      group: 'hero',
      description: 'Exactly three results, in display order. Each one points at a case study result.',
      of: [defineArrayMember({ type: 'heroResult' })],
      validation: (rule) => rule.required().length(3).custom(distinctHeroResults),
    }),
    defineField({ name: 'email',    title: 'Email',    type: 'string', group: 'contact', validation: (rule) => rule.email() }),
    defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url',    group: 'contact' }),
    defineField({ name: 'github',   title: 'GitHub',   type: 'url',    group: 'contact' }),
    defineField({ name: 'cv',       title: 'CV',       type: 'file',   group: 'contact', options: { accept: 'application/pdf' } }),
    defineField({
      name: 'seo',
      title: 'SEO defaults',
      type: 'object',
      group: 'seo',
      description: 'Fallbacks for pages without their own metadata.',
      fields: [
        defineField({ name: 'title',       title: 'Title',       type: 'localeString' }),
        defineField({ name: 'description', title: 'Description', type: 'localeText' }),
        defineField({ name: 'ogImage',     title: 'OG image',    type: 'imageWithAlt', description: '1200×630.' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
