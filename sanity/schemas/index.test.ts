import { describe, it, expect } from 'vitest'
import { CONTENT_TYPES, LEGACY_TYPES, schemaTypes } from './index'

const names = schemaTypes.map((type) => type.name)
const OBJECTS = ['localeString', 'localeText', 'localeBlock', 'metric', 'imageWithAlt']

describe('schema registration', () => {
  it('registers every type exactly once', () => {
    expect(new Set(names).size).toBe(names.length)
  })

  it.each([...OBJECTS, ...CONTENT_TYPES, ...LEGACY_TYPES])('registers %s', (name) => {
    expect(names).toContain(name)
  })

  it('lists every document type in the Studio structure', () => {
    const documents = schemaTypes.filter((t) => t.type === 'document').map((t) => t.name)
    expect([...CONTENT_TYPES, ...LEGACY_TYPES].sort()).toEqual(documents.sort())
  })

  it('gives every document a preview and an icon', () => {
    for (const type of schemaTypes.filter((t) => t.type === 'document')) {
      expect(type.preview, type.name).toBeDefined()
      expect(type.icon, type.name).toBeDefined()
    }
  })
})
