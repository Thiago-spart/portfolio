import { defineField, defineType } from 'sanity'
import type { ValidationContext } from 'sanity'
import { CodeIcon } from '@sanity/icons/Code'

const TECH_CATEGORIES = [
  { title: 'Frontend', value: 'frontend' },
  { title: 'Mobile',   value: 'mobile' },
  { title: 'Backend',  value: 'backend' },
  { title: 'Data',     value: 'data' },
  { title: 'Testing',  value: 'testing' },
  { title: 'Tooling',  value: 'tooling' },
  { title: 'AI',       value: 'ai' },
  { title: 'Practice', value: 'practice' },
]

// Case-insensitive, so "React" and "react" can't both exist.
export async function uniqueTechName(name: string | undefined, context: ValidationContext) {
  if (!name) return true
  const id = context.document?._id.replace(/^drafts\./, '')
  const client = context.getClient({ apiVersion: '2024-01-01' })
  const count = await client.fetch<number>(
    'count(*[_type == "tech" && lower(name) == lower($name) && !(_id in [$id, "drafts." + $id])])',
    { name: name.trim(), id: id ?? '' },
  )
  return count === 0 || `"${name}" already exists`
}

export const tech = defineType({
  name: 'tech',
  title: 'Tech',
  type: 'document',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().custom(uniqueTechName),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: TECH_CATEGORIES },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'url', title: 'URL', type: 'url', description: 'Optional. Official site or docs.' }),
  ],
  orderings: [{ title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', category: 'category' },
    prepare: ({ title, category }) => ({
      title: title ?? 'Unnamed tech',
      subtitle: TECH_CATEGORIES.find((c) => c.value === category)?.title ?? category,
    }),
  },
})
