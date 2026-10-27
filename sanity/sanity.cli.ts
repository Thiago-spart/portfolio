import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from './env'

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    // Deployed Studio picks up new Sanity minor/patch releases without a redeploy.
    // https://www.sanity.io/docs/studio/latest-version-of-sanity
    autoUpdates: true,
  },
})
