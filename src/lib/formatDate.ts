/**
 * Formats a Sanity `date` field ("YYYY-MM-DD") as "Mon YYYY".
 *
 * Parses the parts manually and builds a *local* Date instead of using
 * `new Date(dateStr)`, which parses date-only strings as UTC midnight and can
 * render the previous month for users in negative UTC offsets.
 */
function formatProjectDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

/** "Jan 2024 — Jun 2024", or "Jan 2024 — Present" with no end date; "" with no start date. */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  presentLabel: string,
): string {
  if (!startDate) return ''
  return `${formatProjectDate(startDate)} — ${endDate ? formatProjectDate(endDate) : presentLabel}`
}
