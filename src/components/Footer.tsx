export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 py-10 text-[var(--sea-ink-soft)]">
      <p className="page-wrap m-0 text-center text-sm">
        &copy; {year} Thiago Moraes de Souza. All rights reserved.
      </p>
    </footer>
  )
}
