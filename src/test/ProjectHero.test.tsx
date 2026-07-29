import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
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

  it('renders a gradient fallback instead of an empty img when bgImageSrc is absent', () => {
    render(<ProjectHero title="Portfolio Site" date="Jan 2024" scrollToExpand="Scroll to explore" />)
    expect(screen.getByTestId('project-hero-bg-fallback')).toBeInTheDocument()
    expect(screen.getByTestId('project-hero-media-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('project-hero-image')).not.toBeInTheDocument()
  })

  it('does not autoplay the video and only preloads its metadata', () => {
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
    const video = screen.getByTestId('project-hero-video')
    expect(video).toHaveAttribute('preload', 'metadata')
    expect(video).not.toHaveAttribute('autoplay')
  })

  it('advances the media expansion on keyboard scroll keys', () => {
    render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      />,
    )
    const media = screen.getByTestId('project-hero-media')
    expect(media).toHaveStyle({ width: '300px' })

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(media).not.toHaveStyle({ width: '300px' })
  })

  it('hides the content section from the tab order until it is visible', () => {
    const { container } = render(
      <ProjectHero
        bgImageSrc="https://example.com/cover.jpg"
        title="Portfolio Site"
        date="Jan 2024"
        scrollToExpand="Scroll to explore"
      >
        <a href="https://example.com">Live site</a>
      </ProjectHero>,
    )
    expect(container.querySelector('section[inert]')).not.toBeNull()
  })

  describe('with prefers-reduced-motion', () => {
    afterEach(() => vi.restoreAllMocks())

    it('mounts already expanded and leaves the content section interactive', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('prefers-reduced-motion'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      )

      const { container } = render(
        <ProjectHero
          bgImageSrc="https://example.com/cover.jpg"
          title="Portfolio Site"
          date="Jan 2024"
          scrollToExpand="Scroll to explore"
        >
          <a href="https://example.com">Live site</a>
        </ProjectHero>,
      )

      expect(screen.getByTestId('project-hero-media')).not.toHaveStyle({ width: '300px' })
      expect(container.querySelector('section[inert]')).toBeNull()
    })
  })
})
