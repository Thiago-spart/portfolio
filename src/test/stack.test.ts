import { describe, it, expect } from 'vitest'
import { groupStack } from '../lib/stack'
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

  it('orders rows Frontend, Mobile, Testing, Backend & data, Tooling, AI, Practice, leaving empty ones out', () => {
    expect(groupStack(techs).map((g) => g.key)).toEqual(['frontend', 'testing', 'backend', 'ai'])
    expect(groupStack([])).toEqual([])
  })

  it('merges backend and data into one "Backend & data" row', () => {
    const backend = groupStack(techs).find((g) => g.key === 'backend')
    expect(backend?.techs.map((t) => t.name)).toEqual(['Node.js', 'PostgreSQL'])
    expect(backend?.label).toEqual({ en: 'Backend & data', pt: 'Backend e dados', es: 'Backend y datos' })
  })

  it('sorts by case-study count, most used first, then by name', () => {
    expect(groupStack(techs)[0].techs.map((t) => [t.name, t.count])).toEqual([
      ['React', 8],
      ['Astro', 5],
      ['Next.js', 5],
      ['jQuery', 0],
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
