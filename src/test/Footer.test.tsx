// src/test/Footer.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('has the cyberpunk-surface background class', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toHaveClass('cyberpunk-surface')
  })
})
