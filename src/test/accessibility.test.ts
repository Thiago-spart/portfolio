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

const styles = readFileSync(resolve(__dirname, '../styles.css'), 'utf-8')
const heroCanvasSource = readFileSync(resolve(__dirname, '../components/HeroCanvas.tsx'), 'utf-8')
const projectsSectionSource = readFileSync(resolve(__dirname, '../components/ProjectsSection.tsx'), 'utf-8')

// issue #12: Lighthouse flagged --muted-gray (#5a6a7a) text on the site's dark
// backgrounds at 3.51-3.66:1, below the 4.5:1 WCAG AA minimum for normal text
// (QASection's "ask_thiago.sh" label and Footer's copyright line, both real
// flagged nodes from a live axe-core run against #050508 and #080c18).
describe('muted-gray text contrast (issue #12)', () => {
  const mutedGrayMatch = styles.match(/--muted-gray:\s*(#[0-9a-fA-F]{6});/)

  it('meets 4.5:1 against the site background (#050508)', () => {
    expect(mutedGrayMatch).not.toBeNull()
    expect(contrastRatio(mutedGrayMatch![1], '#050508')).toBeGreaterThanOrEqual(4.5)
  })

  it('meets 4.5:1 against the QA chat-window background (#080c18)', () => {
    expect(mutedGrayMatch).not.toBeNull()
    expect(contrastRatio(mutedGrayMatch![1], '#080c18')).toBeGreaterThanOrEqual(4.5)
  })

  it('HeroCanvas attribution text does not dim an already-borderline color further with opacity', () => {
    const attributionLine = heroCanvasSource.split('\n').find((l) => l.includes('muted-gray'))
    expect(attributionLine).toBeDefined()
    expect(attributionLine).not.toMatch(/opacity-\d/)
  })
})

// issue #12: the "Go to slide N" carousel dots were 8x8px — axe-core's
// target-size rule requires an interactive element's hit area to be at least
// 24x24 CSS px (WCAG 2.5.8). Keep the small 8px visual dot, but the button
// itself needs a 24x24 hit area.
describe('carousel slide-indicator tap target (issue #12)', () => {
  it('renders each dot inside a >=24x24 button hit area', () => {
    const buttonBlock = projectsSectionSource.match(/aria-label=\{`Go to slide[\s\S]*?(?:\/>|<\/button>)/)?.[0]
    expect(buttonBlock).toBeDefined()
    expect(buttonBlock).toMatch(/\bh-6\b/)
    expect(buttonBlock).toMatch(/\bw-6\b/)
  })
})
