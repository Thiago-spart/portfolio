// Brand wordmark per design.md §2 — "Thiago Souza" in nav, collapsing to
// initials "TS" on mobile where there isn't room for the full name.

export default function Logo() {
  return (
    <span
      className="font-['Bebas_Neue'] text-lg tracking-wider text-white uppercase"
      style={{ textShadow: '0 0 16px rgba(0,170,255,0.35)' }}
    >
      <span className="hidden sm:inline">Thiago Souza</span>
      <span className="sm:hidden">TS</span>
    </span>
  )
}
