import { describe, it, expect, vi } from 'vitest'
import type { ValidationContext } from 'sanity'
import { fieldOf, ruleCalls } from './testing'
import { distinctHeroResults, siteSettings } from './siteSettings'
import { heroResult, resultKeyExists } from './objects/heroResult'

const ref = (id: string) => ({ _type: 'reference', _ref: id })

function context(parent: unknown, results: unknown) {
  const fetch = vi.fn().mockResolvedValue(results)
  return {
    ctx: { parent, getClient: () => ({ fetch }) } as unknown as ValidationContext,
    fetch,
  }
}

describe('siteSettings schema', () => {
  it('requires exactly 3 hero results', () => {
    const calls = ruleCalls(fieldOf(siteSettings, 'heroResults').validation)
    expect(calls).toContainEqual({ method: 'length', args: [3] })
    expect(calls.map((c) => c.method)).toContain('required')
  })

  it('rejects the same result picked twice', () => {
    const a = { caseStudy: ref('cs1'), resultKey: 'k1' }
    expect(distinctHeroResults([a, { ...a }, { caseStudy: ref('cs2'), resultKey: 'k1' }])).toMatch(/twice/)
    expect(distinctHeroResults([a, { caseStudy: ref('cs1'), resultKey: 'k2' }, { caseStudy: ref('cs2'), resultKey: 'k1' }])).toBe(true)
  })

  it('validates email', () => {
    expect(ruleCalls(fieldOf(siteSettings, 'email').validation).map((c) => c.method)).toContain('email')
  })
})

describe('heroResult', () => {
  it('points at a case study', () => {
    expect(fieldOf(heroResult, 'caseStudy')).toMatchObject({ type: 'reference', to: [{ type: 'caseStudy' }] })
  })

  it('accepts a key that exists in the case study results', async () => {
    const { ctx, fetch } = context({ caseStudy: ref('cs1') }, [{ _key: 'k1' }, { _key: 'k2' }])
    await expect(resultKeyExists('k2', ctx)).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledWith(expect.any(String), { id: 'cs1' })
  })

  it('rejects a key missing from the case study results', async () => {
    const { ctx } = context({ caseStudy: ref('cs1') }, [{ _key: 'k1' }])
    await expect(resultKeyExists('gone', ctx)).resolves.toMatch(/not in the published case study/)
  })

  it('rejects any key when the case study is unpublished', async () => {
    const { ctx } = context({ caseStudy: ref('cs1') }, null)
    await expect(resultKeyExists('k1', ctx)).resolves.toMatch(/not in the published/)
  })

  it('requires a key', async () => {
    const { ctx } = context({ caseStudy: ref('cs1') }, [])
    await expect(resultKeyExists(undefined, ctx)).resolves.toBe('Pick a result')
  })
})
