import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { localeString } from './schemas/locale/localeString'
import { localeText }   from './schemas/locale/localeText'
import { experience }   from './schemas/experience'
import { qa }           from './schemas/qa'
import { skillCategory } from './schemas/skillCategory'
import { project }      from './schemas/project'

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio Studio',
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [localeString, localeText, experience, qa, skillCategory, project],
  },
})
