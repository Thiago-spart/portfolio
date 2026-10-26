import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RichText from '../components/RichText'
import { paragraphs } from './fixtures'
import type { LocaleBlock } from '../types/sanity.generated'

// The shapes localeBlock allows: paragraphs, bullet/numbered lists,
// strong/em/code and links.
const blocks: LocaleBlock['en'] = [
  {
    _type: 'block',
    _key: 'p1',
    style: 'normal',
    markDefs: [{ _type: 'link', _key: 'l1', href: 'https://web.dev/lcp' }],
    children: [
      { _type: 'span', _key: 's1', text: 'LCP went ', marks: [] },
      { _type: 'span', _key: 's2', text: 'down', marks: ['strong'] },
      { _type: 'span', _key: 's3', text: ', see ', marks: [] },
      { _type: 'span', _key: 's4', text: 'the metric', marks: ['l1'] },
      { _type: 'span', _key: 's5', text: ' and ', marks: [] },
      { _type: 'span', _key: 's6', text: 'useMemo', marks: ['code'] },
    ],
  },
  {
    _type: 'block',
    _key: 'li1',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: 's7', text: 'Split the bundle', marks: [] }],
  },
  {
    _type: 'block',
    _key: 'li2',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: 's8', text: 'Lazy-load the 3D hero', marks: [] }],
  },
]

describe('RichText', () => {
  it('renders paragraphs, marks, lists and links', () => {
    const { container } = render(<RichText value={blocks} />)
    expect(container.querySelector('p')).toHaveTextContent('LCP went down, see the metric and useMemo')
    expect(screen.getByText('down').tagName).toBe('STRONG')
    expect(screen.getByText('useMemo').tagName).toBe('CODE')
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Split the bundle',
      'Lazy-load the 3D hero',
    ])
  })

  it('opens external links in a new tab', () => {
    render(<RichText value={blocks} />)
    const link = screen.getByRole('link', { name: 'the metric' })
    expect(link).toHaveAttribute('href', 'https://web.dev/lcp')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('applies the wrapper class', () => {
    const { container } = render(<RichText value={paragraphs('One.')} className="text-sm" />)
    expect(container.firstElementChild).toHaveClass('text-sm')
  })

  it('renders nothing for empty or missing content', () => {
    expect(render(<RichText value={[]} />).container).toBeEmptyDOMElement()
    expect(render(<RichText value={null} />).container).toBeEmptyDOMElement()
  })
})
