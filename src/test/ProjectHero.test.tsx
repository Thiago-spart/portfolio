import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectHero from '../components/ProjectHero'

describe('ProjectHero', () => {
  it('splits the title into a first word and the rest, rendered separately', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site Rebuild"
        date="Jan 2024 — Present"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Site Rebuild')).toBeInTheDocument()
  })

  it('renders the date and scroll hint text', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024 — Present"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByText('Jan 2024 — Present')).toBeInTheDocument()
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument()
  })

  it('renders the image-expansion variant when videoSrc is absent', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByTestId('project-hero-image')).toBeInTheDocument()
    expect(screen.queryByTestId('project-hero-video')).not.toBeInTheDocument()
  })

  it('renders the video variant when videoSrc is present', () => {
    render(
      <ProjectHero
        videoSrc="https://example.com/demo.mp4"
        posterSrc="https://example.com/cover.jpg"
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    expect(screen.getByTestId('project-hero-video')).toBeInTheDocument()
    expect(screen.queryByTestId('project-hero-image')).not.toBeInTheDocument()
  })

  it('renders children content in the section below the hero', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      >
        <p>Overview text</p>
      </ProjectHero>,
    )
    expect(screen.getByText('Overview text')).toBeInTheDocument()
  })
})
