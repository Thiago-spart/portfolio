import { describe, it, expect, vi } from 'vitest'
import { localeString } from './localeString'

describe('localeString schema', () => {
  it.each(['en', 'pt', 'es'])('requires the %s sub-field', (name) => {
    const field = localeString.fields.find((f) => f.name === name)
    expect(field?.validation).toBeDefined()

    const required = vi.fn().mockReturnThis()
    const rule = { required }
    field?.validation(rule as never)

    expect(required).toHaveBeenCalled()
  })
})
