import { describe, it, expect } from 'vitest'
import { formatRoleDates } from '../lib/formatDate'

describe('formatRoleDates', () => {
  it('ends an ongoing role with the "now" label', () => {
    expect(formatRoleDates('2025-01-01', null, 'en', 'now')).toBe('Jan 2025 – now')
  })

  it('writes both ends across years', () => {
    expect(formatRoleDates('2023-02-01', '2025-01-31', 'en', 'now')).toBe('Feb 2023 – Jan 2025')
  })

  it('collapses the year when both ends share it', () => {
    expect(formatRoleDates('2021-08-01', '2021-10-31', 'en', 'now')).toBe('Aug – Oct 2021')
  })

  it('shows one month when start and end share it', () => {
    expect(formatRoleDates('2021-08-01', '2021-08-20', 'en', 'now')).toBe('Aug 2021')
  })

  it('uses Portuguese month names, capitalized and without the period', () => {
    expect(formatRoleDates('2023-02-01', '2025-05-31', 'pt', 'hoje')).toBe('Fev 2023 – Mai 2025')
    expect(formatRoleDates('2021-08-01', '2021-10-31', 'pt', 'hoje')).toBe('Ago – Out 2021')
    expect(formatRoleDates('2025-01-01', null, 'pt', 'hoje')).toBe('Jan 2025 – hoje')
  })

  it('uses Spanish month names', () => {
    expect(formatRoleDates('2022-01-01', '2022-12-31', 'es', 'hoy')).toBe('Ene – Dic 2022')
    expect(formatRoleDates('2025-01-01', null, 'es', 'hoy')).toBe('Ene 2025 – hoy')
  })

  it('does not shift a 1st-of-month date into the previous month', () => {
    expect(formatRoleDates('2021-08-01', '2022-03-01', 'en', 'now')).toBe('Aug 2021 – Mar 2022')
  })
})
