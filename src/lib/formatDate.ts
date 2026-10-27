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
