import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { READING_BAND, useReadingSection } from '../lib/useReadingSection'
import { FakeObserver, fire } from './fakeObserver'

const IDS = ['problem', 'decision', 'approach'] as const

function Probe() {
  const current = useReadingSection(IDS)
  return <p data-testid="current">{current ?? 'none'}</p>
}

function renderParts() {
  render(
    <>
      <Probe />
      {IDS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>,
  )
}

const current = () => screen.getByTestId('current').textContent
const part = (id: string) => document.getElementById(id) as HTMLElement
const footer = () => document.querySelector('body > footer') as HTMLElement

let original: typeof IntersectionObserver

beforeEach(() => {
  original = window.IntersectionObserver
  FakeObserver.instances = []
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
  document.body.appendChild(document.createElement('footer'))
})

afterEach(() => {
  window.IntersectionObserver = original
  footer()?.remove()
})

describe('useReadingSection', () => {
  it('watches the given ids on the reading band, a line just under mid-viewport', () => {
    renderParts()
    const band = FakeObserver.instances.find((o) => o.targets.has(part('problem')))
    expect(band?.options.rootMargin).toBe(READING_BAND)
    expect([...band!.targets].map((el) => el.id)).toEqual([...IDS])
  })

  it('is null until a section crosses the band, then the first one in page order', () => {
    renderParts()
    expect(current()).toBe('none')
    fire(part('approach'), true)
    fire(part('decision'), true)
    expect(current()).toBe('decision')
    fire(part('decision'), false)
    expect(current()).toBe('approach')
  })

  it('is the last id once the footer is fully on screen', () => {
    renderParts()
    fire(part('decision'), true)
    fire(footer(), true)
    expect(current()).toBe('approach')
  })
})
