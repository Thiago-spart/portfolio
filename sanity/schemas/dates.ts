import type { ValidationContext } from 'sanity'

// Shared by role and caseStudy: endDate may be empty (ongoing), but never
// before startDate. ISO dates compare correctly as strings.
export function endAfterStart(endDate: string | undefined, context: ValidationContext) {
  const startDate = context.document?.startDate
  if (!endDate || typeof startDate !== 'string') return true
  return endDate >= startDate || 'End date must be on or after the start date'
}

export function yearRange(startDate?: string, endDate?: string) {
  if (!startDate) return undefined
  return `${startDate.slice(0, 4)}–${endDate ? endDate.slice(0, 4) : 'now'}`
}
