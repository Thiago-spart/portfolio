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

// "Jan", "Fev", "Ene": the locale's short month name as a standalone label,
// capitalized and without the trailing period pt and es add ("fev.").
function shortMonth(month: number, lang: string): string {
  const name = new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, month - 1, 1)))
    .replace(/\.$/, '')
  return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1)
}

/**
 * The Experience timeline's dates, from Sanity `date` fields ("YYYY-MM-DD"):
 * "Jan 2025 – now" while ongoing, "Feb 2023 – Jan 2025", and "Aug – Oct 2021"
 * when both ends share a year (the month alone when they share that too).
 * Month names follow `lang`.
 */
export function formatRoleDates(
  startDate: string,
  endDate: string | null | undefined,
  lang: string,
  nowLabel: string,
): string {
  const [startYear, startMonth] = startDate.split('-').map(Number)
  const start = `${shortMonth(startMonth, lang)} ${startYear}`
  if (!endDate) return `${start} – ${nowLabel}`

  const [endYear, endMonth] = endDate.split('-').map(Number)
  const end = `${shortMonth(endMonth, lang)} ${endYear}`
  if (startYear !== endYear) return `${start} – ${end}`
  if (startMonth === endMonth) return end
  return `${shortMonth(startMonth, lang)} – ${end}`
}
