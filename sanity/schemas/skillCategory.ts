export const skillCategory = {
  name: 'skillCategory',
  title: 'Skill Category',
  type: 'document',
  fields: [
    { name: 'category', title: 'Category', type: 'localeString' },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Name', type: 'string' },
          { name: 'icon', title: 'Icon (lucide name)', type: 'string' },
        ],
      }],
    },
    { name: 'order', title: 'Order', type: 'number' },
  ],
}
