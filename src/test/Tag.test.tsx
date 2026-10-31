import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tag } from '../components/ui/Tag'

describe('Tag', () => {
  it('renders the label alone by default', () => {
    const { container } = render(<Tag label="Vitest" />)
    expect(container.textContent).toBe('Vitest')
    expect(container.firstElementChild).toHaveClass('border-line-strong', 'text-ink')
  })

  it('marks core techs with the mangrove tint', () => {
    render(<Tag label="TypeScript" core />)
    const tag = screen.getByText('TypeScript')
    expect(tag).toHaveAttribute('data-core', 'true')
    expect(tag).toHaveClass('bg-mangrove-soft', 'text-mangrove')
  })
})
