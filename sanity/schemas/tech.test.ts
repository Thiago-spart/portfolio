import { describe, it, expect, vi } from 'vitest'
import type { ValidationContext } from 'sanity'
import { fieldOf, isRequired } from './testing'
import { tech, uniqueTechName } from './tech'

function contextWithCount(count: number) {
  const fetch = vi.fn().mockResolvedValue(count)
  const context = {
    document: { _id: 'drafts.abc', _type: 'tech' },
    getClient: () => ({ fetch }),
  } as unknown as ValidationContext
  return { context, fetch }
}

describe('tech schema', () => {
  it.each(['name', 'category'])('requires %s', (name) => {
    expect(isRequired(fieldOf(tech, name))).toBe(true)
  })

  it('previews the category title as subtitle', () => {
    expect(tech.preview?.prepare?.({ title: 'React', category: 'frontend' })).toMatchObject({
      title: 'React',
      subtitle: 'Frontend',
    })
  })

  it('accepts a name no other tech uses, ignoring its own draft', async () => {
    const { context, fetch } = contextWithCount(0)
    await expect(uniqueTechName('React', context)).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledWith(expect.any(String), { name: 'React', id: 'abc' })
  })

  it('rejects a name another tech already uses', async () => {
    const { context } = contextWithCount(1)
    await expect(uniqueTechName('react', context)).resolves.toMatch(/already exists/)
  })
})
