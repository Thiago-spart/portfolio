import { describe, it, expect } from 'vitest'
import { LEGACY_TYPES, schemaTypes } from './index'

const names = schemaTypes.map((type) => type.name)

describe('schema registration', () => {
  it('registers every type exactly once', () => {
    expect(new Set(names).size).toBe(names.length)
  })

  it.each(['localeString', 'localeText', ...LEGACY_TYPES])('registers %s', (name) => {
    expect(names).toContain(name)
  })

  it('gives every document a preview and an icon', () => {
    for (const type of schemaTypes.filter((t) => t.type === 'document')) {
      expect(type.preview, type.name).toBeDefined()
      expect(type.icon, type.name).toBeDefined()
    }
  })
})
