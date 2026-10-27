import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// WCAG 2.x relative luminance / contrast ratio (no library — same formula axe-core uses).
function relativeLuminance(hex: string): number {
  const [r, g, b] = (hex.match(/.{2}/g) ?? []).map((h) => {
    const v = parseInt(h, 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA.replace('#', ''))
  const l2 = relativeLuminance(hexB.replace('#', ''))
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

const tokens = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf-8')
const heroCanvasSource = readFileSync(resolve(__dirname, '../components/HeroCanvas.tsx'), 'utf-8')

// The first declaration block for each theme: light is the bare :root, dark
// is the [data-theme='dark'] block (the media-query block repeats it).
function themeTokens(theme: 'light' | 'dark'): Record<string, string> {
  const block =
    theme === 'light'
      ? tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('@media'))
      : tokens.slice(tokens.indexOf(":root[data-theme='dark']"))
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [m[1], m[2]]),
  )
}

// tokens.json promises WCAG AA (4.5:1) for every text pair below, in both
// themes; the hex values in tokens.css must keep that promise.
describe.each(['light', 'dark'] as const)('brand text contrast (%s theme)', (theme) => {
  const t = themeTokens(theme)
  const pairs: Array<[string, string]> = [
    ['ink', 'ground'],
    ['ink', 'surface-raised'],
    ['ink', 'surface-sunken'],
    ['ink-muted', 'ground'],
    ['ink-muted', 'surface-raised'],
    ['ink-muted', 'surface-sunken'],
    ['mangrove', 'ground'],
    ['mangrove', 'surface-raised'],
    ['on-mangrove', 'mangrove'],
    ['mango', 'ground'],
    ['mango', 'surface-raised'],
    ['on-mango', 'mango'],
  ]

  it.each(pairs)('%s on %s meets 4.5:1', (fg, bg) => {
    expect(t[fg]).toBeDefined()
    expect(t[bg]).toBeDefined()
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it('line-strong (control borders) meets 3:1 on ground and surface-raised', () => {
    expect(contrastRatio(t['line-strong'], t.ground)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(t['line-strong'], t['surface-raised'])).toBeGreaterThanOrEqual(3)
  })
})

describe('HeroCanvas attribution', () => {
  it('does not dim the muted text color further with opacity', () => {
    const attributionLine = heroCanvasSource.split('\n').find((l) => l.includes('text-ink-muted'))
    expect(attributionLine).toBeDefined()
    expect(attributionLine).not.toMatch(/opacity-\d/)
  })
})
