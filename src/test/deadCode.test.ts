import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// issue #13: dead-code audit. companyLogoUrl was fetched from Sanity on
// every request but never rendered anywhere — removed rather than wired up,
// since rendering it would be new feature work, not cleanup. The role type
// (#44) dropped the field; the timeline query must not bring it back.
describe('companyLogoUrl removal (issue #13)', () => {
  it('is not projected in the roles GROQ query', () => {
    const query = readFileSync(resolve(__dirname, '../lib/queries/roles.ts'), 'utf-8')
    expect(query).not.toMatch(/companyLogo/)
  })
})

// issue #13: public/models/living_things.glb (15MB) had zero references in
// src/. (The Mangrove hero later dropped the last model, the R3F hologram.)
describe('unreferenced asset removal (issue #13)', () => {
  it('living_things.glb no longer exists in public/models', () => {
    expect(existsSync(resolve(__dirname, '../../public/models/living_things.glb'))).toBe(false)
  })
})
