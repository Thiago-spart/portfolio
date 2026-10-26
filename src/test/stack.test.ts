import { describe, it, expect } from 'vitest'
import { groupStack } from '../lib/stack'

describe('groupStack', () => {
  const techs = [
    { _id: '1', name: 'Next.js',    category: 'frontend' as const },
    { _id: '2', name: 'Playwright', category: 'testing' as const },
    { _id: '3', name: 'React',      category: 'frontend' as const },
    { _id: '4', name: 'Node.js',    category: 'backend' as const },
  ]

  it('groups techs by category in the fixed category order', () => {
    expect(groupStack(techs).map((g) => g.category)).toEqual(['frontend', 'backend', 'testing'])
  })

  it('keeps the query order (by name) inside a group', () => {
    expect(groupStack(techs)[0].techs).toEqual(['Next.js', 'React'])
  })

  it('leaves categories without techs out', () => {
    const categories = groupStack(techs).map((g) => g.category)
    expect(categories).not.toContain('mobile')
    expect(groupStack([])).toEqual([])
  })

  it('labels each category in every language', () => {
    const testing = groupStack(techs).find((g) => g.category === 'testing')
    expect(testing?.label).toEqual({ en: 'Testing', pt: 'Testes', es: 'Pruebas' })
  })
})
