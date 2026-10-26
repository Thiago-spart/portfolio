import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { projectId, dataset } from './env'
import { schemaTypes } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio Studio',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
