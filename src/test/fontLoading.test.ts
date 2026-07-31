import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The hero headline renders `font-family: 'Bebas Neue'` at up to 96px with
// `leading-none`. Its fallback stack (ui-sans-serif/system-ui/sans-serif)
// renders a ~50% taller line box at that size, so `display=swap` produces a
// large, real layout shift once the webfont swaps in (see issue #10: CLS
// ~1.0 on the home page). `display=optional` avoids the swap entirely: the
// browser either has the font in time for first paint or keeps the
// fallback for the page's lifetime, never reflowing.
describe('Google Fonts loading strategy', () => {
  const css = readFileSync(resolve(__dirname, '../styles.css'), 'utf-8')
  const fontImports = [...css.matchAll(/@import url\('(https:\/\/fonts\.googleapis\.com\/css2\?[^']+)'\);/g)].map(
    (m) => m[1],
  )

  it('loads Bebas Neue with display=optional to prevent hero-headline layout shift', () => {
    const bebasImport = fontImports.find((url) => url.includes('Bebas'))
    expect(bebasImport).toBeDefined()
    expect(new URL(bebasImport!).searchParams.get('display')).toBe('optional')
  })

  it('keeps body/heading fonts on display=swap', () => {
    const bodyImport = fontImports.find((url) => url.includes('Manrope') || url.includes('Rajdhani'))
    expect(bodyImport).toBeDefined()
    expect(new URL(bodyImport!).searchParams.get('display')).toBe('swap')
  })
})
