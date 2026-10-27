import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { THEME_INIT_SCRIPT } from '../lib/theme'

const root = document.documentElement
const systemLight = vi.mocked(window.matchMedia).getMockImplementation()

function runInitScript() {
  // The same code the root document inlines in <head>.
  new Function(THEME_INIT_SCRIPT)()
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    root.removeAttribute('data-theme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.mocked(window.matchMedia).mockImplementation(systemLight!)
    root.removeAttribute('data-theme')
  })

  it('offers the dark theme while the system is light', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
    expect(root).not.toHaveAttribute('data-theme')
  })

  it('switches to dark: sets data-theme, remembers it, and offers light', async () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    expect(root).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(await screen.findByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  })

  it('switches back to light and remembers that too', async () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Light theme' }))
    expect(root).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('reflects a theme applied before hydration by the init script', () => {
    localStorage.setItem('theme', 'dark')
    runInitScript()
    expect(root).toHaveAttribute('data-theme', 'dark')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  })

  it('follows the system when nothing is stored', () => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    runInitScript()
    expect(root).not.toHaveAttribute('data-theme')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  })

  it('ignores an unknown stored value (the old "auto")', () => {
    localStorage.setItem('theme', 'auto')
    runInitScript()
    expect(root).not.toHaveAttribute('data-theme')
  })

  it('still switches when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }))
    expect(root).toHaveAttribute('data-theme', 'dark')
  })
})
