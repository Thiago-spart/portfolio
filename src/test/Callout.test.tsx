import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Callout } from '../components/ui/Callout'

describe('Callout', () => {
  it('renders a plain label as an uppercase eyebrow', () => {
    const { container } = render(<Callout label="Contact" />)
    expect(screen.getByText('Contact')).toHaveClass('type-label')
    expect(container.textContent).toBe('Contact')
  })

  it('puts the number in a circle before the label, hidden from assistive tech', () => {
    const { container } = render(<Callout label="Prop root" number={1} />)
    const number = screen.getByText('1')
    expect(number).toHaveClass('rounded-full')
    expect(number).toHaveAttribute('aria-hidden', 'true')
    expect(container.textContent).toBe('1Prop root')
  })
})
