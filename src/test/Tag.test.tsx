import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tag } from '../components/ui/Tag'

describe('Tag', () => {
  it('renders the label alone by default', () => {
    const { container } = render(<Tag label="Vitest" />)
    expect(container.textContent).toBe('Vitest')
    expect(container.firstElementChild).toHaveClass('border-line-strong', 'text-ink')
  })

  it('shows the count, muted, after the label', () => {
    render(<Tag label="React" count={7} />)
    const count = screen.getByText('7')
    expect(count).toHaveClass('text-ink-muted')
    expect(count.parentElement?.textContent).toBe('React7')
  })

  it('shows a count of 0', () => {
    render(<Tag label="Vue" count={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('marks core techs with the mangrove tint', () => {
    render(<Tag label="TypeScript" core />)
    const tag = screen.getByText('TypeScript')
    expect(tag).toHaveAttribute('data-core', 'true')
    expect(tag).toHaveClass('bg-mangrove-soft', 'text-mangrove')
  })
})
