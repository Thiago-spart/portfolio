import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// issue #13: dead-code audit. companyLogoUrl was fetched from Sanity on
// every request but never rendered anywhere — removed rather than wired up,
// since rendering it would be new feature work, not cleanup. The Sanity
// schema field itself is a content-modeling decision and stays untouched.
describe('companyLogoUrl removal (issue #13)', () => {
  it('is no longer projected in the experiences GROQ query', () => {
    const query = readFileSync(resolve(__dirname, '../lib/queries/experiences.ts'), 'utf-8')
    expect(query).not.toMatch(/companyLogo/)
  })

  it('is no longer declared on SanityExperience', () => {
    const types = readFileSync(resolve(__dirname, '../types/sanity.ts'), 'utf-8')
    expect(types).not.toMatch(/companyLogoUrl/)
  })
})

// issue #13: public/models/living_things.glb (15MB) had zero references in
// src/ — only looking_glass_hologram_concept_3.glb (HeroModel.tsx) is used.
describe('unreferenced asset removal (issue #13)', () => {
  it('living_things.glb no longer exists in public/models', () => {
    expect(existsSync(resolve(__dirname, '../../public/models/living_things.glb'))).toBe(false)
  })
})
