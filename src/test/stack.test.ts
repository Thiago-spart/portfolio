import { describe, it, expect } from 'vitest'
import { filterByTech, findTech, groupStack, techSearch, techSlug } from '../lib/stack'
import type { STACK_QUERY_RESULT } from '../types/sanity.generated'

type Tech = STACK_QUERY_RESULT['techs'][number]
const tech = (name: string, category: Tech['category'], caseStudies: number): Tech => ({
  _id: name,
  name,
  category,
  caseStudies,
})

describe('groupStack', () => {
  const techs = [
    tech('Next.js', 'frontend', 5),
    tech('Playwright', 'testing', 2),
    tech('React', 'frontend', 8),
    tech('Node.js', 'backend', 1),
    tech('PostgreSQL', 'data', 1),
    tech('Claude', 'ai', 2),
    tech('Astro', 'frontend', 5),
    tech('jQuery', 'frontend', 0),
  ]

  it('orders rows Frontend, Mobile, Testing, Backend & data, leaving empty ones, AI, tooling and practice out', () => {
    const rows = groupStack([...techs, tech('Git', 'tooling', 12), tech('BFF', 'practice', 3)])
    // Node.js and PostgreSQL are used once each, so Backend & data is empty.
    expect(rows.map((g) => g.key)).toEqual(['frontend', 'testing'])
    expect(groupStack([])).toEqual([])
  })

  it('merges backend and data into one "Backend & data" row', () => {
    const backend = groupStack([...techs, tech('GraphQL', 'backend', 2), tech('Firebase', 'data', 2)]).find((g) => g.key === 'backend')
    expect(backend?.techs.map((t) => t.name)).toEqual(['Firebase', 'GraphQL'])
    expect(backend?.label).toEqual({ en: 'Backend & data', pt: 'Backend e dados', es: 'Backend y datos' })
  })

  it('keeps techs two or more case studies use, core techs at any count, five per row at most', () => {
    const many = Array.from({ length: 8 }, (_, i) => tech(`Lib ${i}`, 'frontend', 9 - i))
    const frontend = groupStack([...many, tech('TypeScript', 'frontend', 1)]).find((g) => g.key === 'frontend')
    expect(frontend?.techs.map((t) => t.name)).toEqual(['Lib 0', 'Lib 1', 'Lib 2', 'Lib 3', 'TypeScript'])
  })

  it('sorts by case-study count, most used first, then by name', () => {
    expect(groupStack(techs)[0].techs.map((t) => [t.name, t.count])).toEqual([
      ['React', 8],
      ['Astro', 5],
      ['Next.js', 5],
    ])
  })

  it('marks React, React Native and TypeScript as core', () => {
    const groups = groupStack([...techs, tech('React Native', 'mobile', 3), tech('TypeScript', 'frontend', 10)])
    const core = groups.flatMap((g) => g.techs.filter((t) => t.core).map((t) => t.name))
    expect(core).toEqual(['TypeScript', 'React', 'React Native'])
  })

  it('labels each row in every language', () => {
    const testing = groupStack(techs).find((g) => g.key === 'testing')
    expect(testing?.label).toEqual({ en: 'Testing', pt: 'Testes', es: 'Pruebas' })
  })
})

describe('techSlug', () => {
  it('makes a URL-safe slug of a tech name', () => {
    expect(techSlug('React Native')).toBe('react-native')
    expect(techSlug('Next.js')).toBe('next-js')
    expect(techSlug('Tailwind CSS')).toBe('tailwind-css')
    expect(techSlug('Vue')).toBe('vue')
  })
})

describe('techSearch', () => {
  it('keeps a non-empty ?tech= string, trimmed and lower-cased', () => {
    expect(techSearch({ tech: ' React-Native ' })).toEqual({ tech: 'react-native' })
  })

  it('drops anything else', () => {
    expect(techSearch({})).toEqual({})
    expect(techSearch({ tech: '' })).toEqual({})
    expect(techSearch({ tech: 42 })).toEqual({})
    expect(techSearch({ tech: ['react'] })).toEqual({})
  })
})

describe('findTech', () => {
  const groups = groupStack([
    tech('React Native', 'mobile', 3),
    tech('Next.js', 'frontend', 5),
    tech('jQuery', 'frontend', 0),
  ])

  it('finds a tech shown in the Stack rows by its slug or its name', () => {
    expect(findTech(groups, 'react-native')).toBe('React Native')
    expect(findTech(groups, 'next.js')).toBe('Next.js')
    expect(findTech(groups, 'next-js')).toBe('Next.js')
  })

  it('finds nothing for a tech the rows leave out, or no param', () => {
    expect(findTech(groups, 'jquery')).toBeNull()
    expect(findTech(groups, 'cobol')).toBeNull()
    expect(findTech(groups, undefined)).toBeNull()
  })
})

describe('filterByTech', () => {
  const cases = [
    { _id: 'a', stack: ['React', 'React Native'], roleId: 'capitual' },
    { _id: 'b', stack: ['React Native'], roleId: 'capitual' },
    { _id: 'c', stack: ['React'], roleId: 'c6' },
    { _id: 'd', stack: null, roleId: 'redacao' },
    { _id: 'e', stack: ['React Native'], roleId: null },
  ]

  it('keeps the case studies that use the tech, and marks their roles once each', () => {
    const { using, marked } = filterByTech(cases, 'React Native')
    expect(using.map((c) => c._id)).toEqual(['a', 'b', 'e'])
    expect([...marked]).toEqual(['capitual'])
  })

  it('selects nothing without a tech', () => {
    const { using, marked } = filterByTech(cases, null)
    expect(using).toEqual([])
    expect(marked.size).toBe(0)
  })
})
