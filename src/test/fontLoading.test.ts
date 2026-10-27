import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(__dirname, '../styles.css'), 'utf-8')
const fonts = readFileSync(resolve(__dirname, '../styles/fonts.css'), 'utf-8')
const root = readFileSync(resolve(__dirname, '../routes/__root.tsx'), 'utf-8')

const faces = [...fonts.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1])
const family = (face: string) => face.match(/font-family:\s*'([^']+)'/)?.[1]

// Brand fonts are self-hosted (src/styles/fonts.css): no third-party
// request on the critical path, and the swap can't shift the layout because
// each family has a metric-matched local fallback (CLS 0).
describe('font loading', () => {
  it('does not load fonts from Google Fonts', () => {
    expect(styles).not.toMatch(/fonts\.googleapis\.com/)
    expect(fonts).not.toMatch(/fonts\.googleapis\.com/)
    expect(root).not.toMatch(/fonts\.googleapis\.com/)
  })

  it('drops the old display faces', () => {
    for (const old of ['Bebas', 'Rajdhani', 'Manrope']) {
      expect(styles).not.toContain(old)
      expect(fonts).not.toContain(old)
    }
  })

  it.each(['Newsreader', 'Public Sans', 'JetBrains Mono'])(
    'self-hosts %s for latin and latin-ext only, with font-display: swap',
    (name) => {
      const own = faces.filter((f) => family(f) === name)
      expect(own).toHaveLength(2)
      for (const face of own) {
        expect(face).toMatch(/font-display:\s*swap/)
        expect(face).toMatch(/files\/[a-z-]+-latin(-ext)?-wght-normal\.woff2/)
      }
    },
  )

  it.each(['Newsreader', 'Public Sans', 'JetBrains Mono'])(
    'gives %s a metric-matched fallback that its font stack uses',
    (name) => {
      const fallback = faces.find((f) => family(f) === `${name} Fallback`)
      expect(fallback).toBeDefined()
      expect(fallback).toMatch(/src:\s*local\(/)
      expect(fallback).toMatch(/size-adjust:\s*[\d.]+%/)
      expect(fallback).toMatch(/ascent-override:\s*[\d.]+%/)
      expect(fallback).toMatch(/descent-override:\s*[\d.]+%/)
      expect(styles).toContain(`'${name}', '${name} Fallback'`)
    },
  )

  it('preloads the headline font (the LCP element)', () => {
    expect(root).toMatch(/newsreader-latin-wght-normal\.woff2\?url/)
    expect(root).toMatch(/rel: 'preload'[\s\S]*?as: 'font'[\s\S]*?crossOrigin: 'anonymous'/)
  })
})
