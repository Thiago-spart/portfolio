import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Container, Section } from '../components/ui/Section'

describe('Section', () => {
  it('is labelled by its heading', () => {
    render(
      <Section id="stack" heading="Stack" lede="What I build with.">
        <p>content</p>
      </Section>,
    )
    const section = screen.getByRole('region', { name: 'Stack' })
    expect(section).toHaveAttribute('id', 'stack')
    expect(screen.getByRole('heading', { level: 2, name: 'Stack' })).toHaveAttribute('id', 'stack-heading')
    expect(screen.getByText('What I build with.')).toHaveClass('type-lede')
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders without a head', () => {
    const { container } = render(
      <Section>
        <p>content</p>
      </Section>,
    )
    expect(container.querySelector('h2')).toBeNull()
    expect(container.querySelector('section')).not.toHaveAttribute('aria-labelledby')
  })

  it('puts content in the 1120 column with the page gutters', () => {
    const { container } = render(<Container>x</Container>)
    expect(container.firstElementChild).toHaveClass('max-w-content', 'box-content', 'px-4', 'md:px-6')
  })
})
