import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from './env'

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    // Deployed Studio picks up new Sanity minor/patch releases without a redeploy.
    // https://www.sanity.io/docs/studio/latest-version-of-sanity
    autoUpdates: true,
  },
  // `pnpm --dir sanity typegen` extracts the schema and writes types for the
  // app (schema types + any defineQuery/groq queries found under ../src).
  typegen: {
    path: '../src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../src/types/sanity.generated.ts',
  },
})
