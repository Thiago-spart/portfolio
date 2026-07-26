export const experience = {
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    { name: 'company',     title: 'Company',      type: 'string' },
    { name: 'companyUrl',  title: 'Company URL',   type: 'url' },
    { name: 'companyLogo', title: 'Company Logo',  type: 'image' },
    { name: 'role',        title: 'Role',          type: 'localeString' },
    { name: 'description', title: 'Description',   type: 'localeString' },
    { name: 'startDate',   title: 'Start Date',    type: 'date' },
    { name: 'endDate',     title: 'End Date',      type: 'date' },
    {
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'value', title: 'Value', type: 'string' },
          { name: 'label', title: 'Label', type: 'localeString' },
        ],
      }],
    },
  ],
  orderings: [{ title: 'Start Date, Newest', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
}
