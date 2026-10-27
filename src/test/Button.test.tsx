import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Moon } from 'lucide-react'
import { Button } from '../components/ui/Button'

describe('Button', () => {
  it('renders a <button type="button"> without an href', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Get in touch</Button>)
    const button = screen.getByRole('button', { name: 'Get in touch' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('keeps an explicit type', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit')
  })

  it('renders an <a> with the href when given one', () => {
    render(
      <Button href="mailto:hi@example.com" variant="secondary">
        Email
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Email' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'mailto:hi@example.com')
    expect(link).not.toHaveAttribute('type')
  })

  it('passes link attributes through', () => {
    render(
      <Button href="https://example.com" target="_blank" rel="noreferrer">
        LinkedIn
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'LinkedIn' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('applies the variant and size classes', () => {
    render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary" size="small">
          Secondary
        </Button>
        <Button variant="ghost" size="small">
          Ghost
        </Button>
      </>,
    )
    expect(screen.getByText('Primary')).toHaveClass('bg-mangrove', 'text-on-mangrove', 'h-11', 'px-4')
    expect(screen.getByText('Secondary')).toHaveClass('border-line-strong', 'text-ink', 'h-8', 'px-3')
    expect(screen.getByText('Ghost')).toHaveClass('text-mangrove', 'h-8', 'px-2')
  })

  it('draws an optional icon, hidden from assistive tech, before the label', () => {
    render(<Button icon={Moon}>Dark theme</Button>)
    const button = screen.getByRole('button', { name: 'Dark theme' })
    const svg = button.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(button.firstElementChild).toBe(svg)
  })

  it('is disabled when asked, and does not fire clicks', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Send
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Send' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
