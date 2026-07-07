export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="cyberpunk-surface mt-20 border-t border-[rgba(0,170,255,0.15)] px-4 py-10 text-[#5a6a7a]">
      <p className="page-wrap m-0 text-center text-sm">
        &copy; {year} Thiago Moraes de Souza. All rights reserved.
      </p>
    </footer>
  )
}
