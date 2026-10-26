// Shared by sanity.config.ts (bundled into the browser) and sanity.cli.ts (Node).
//
// The Sanity CLI only inlines env vars prefixed with SANITY_STUDIO_ into the
// Studio bundle, so the unprefixed SANITY_PROJECT_ID would be undefined in a
// built/deployed Studio. The project ID and dataset are public (they appear in
// every API URL the site requests), so the fallbacks are safe to commit and
// let `pnpm --dir sanity dev` work without any .env file.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'wbbntp0o'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
